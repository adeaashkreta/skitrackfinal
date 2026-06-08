import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Plus, Send } from "lucide-react";
import { ticketStore } from "@/lib/ticketStore";
import { useAuth } from "@/context/AuthContext";
import type { Ticket, TicketStatus } from "@/lib/api";
import { demoResorts } from "@/lib/demoData";

type Scope = "user" | "manager" | "admin";

export function TicketsPanel({ scope }: { scope: Scope }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const refresh = () => {
    if (!user) return setTickets([]);
    if (scope === "user") setTickets(ticketStore.forUser(user._id));
    else if (scope === "manager") setTickets(ticketStore.forManager(user._id));
    else setTickets(ticketStore.all());
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("tickets:changed", onChange);
    return () => window.removeEventListener("tickets:changed", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, scope]);

  // keep active ticket in sync after reply
  useEffect(() => {
    if (!active) return;
    const fresh = tickets.find((t) => t._id === active._id);
    if (fresh) setActive(fresh);
  }, [tickets, active]);

  const statusVariant = (s: TicketStatus) =>
    s === "open" ? "default" : s === "pending" ? "secondary" : "outline";

  const handleSendReply = () => {
    if (!user || !active || !reply.trim()) return;
    ticketStore.reply(active._id, { name: user.name, role: user.role }, reply.trim());
    setReply("");
    toast.success("Reply sent");
  };

  const handleSetStatus = (s: TicketStatus) => {
    if (!active) return;
    ticketStore.setStatus(active._id, s);
    toast.success(`Marked ${s}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </p>
        {scope === "user" && (
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New ticket
          </Button>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2" />
          No tickets yet.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
            {tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => setActive(t)}
                className={`w-full text-left px-4 py-3 hover:bg-accent/40 transition-colors ${
                  active?._id === t._id ? "bg-accent/60" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{t.subject}</span>
                  <Badge variant={statusVariant(t.status)} className="capitalize">{t.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex justify-between gap-2">
                  <span className="truncate">
                    {scope === "user" ? t.resortName ?? "—" : `${t.userName} · ${t.resortName ?? "—"}`}
                  </span>
                  <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 min-h-[300px]">
            {!active ? (
              <p className="text-sm text-muted-foreground">Select a ticket to view the thread.</p>
            ) : (
              <div className="flex flex-col h-full">
                <div className="pb-3 mb-3 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{active.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {active.userName}
                        {active.resortName && ` · ${active.resortName}`}
                      </p>
                    </div>
                    {scope !== "user" ? (
                      <Select value={active.status} onValueChange={(v) => handleSetStatus(v as TicketStatus)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={statusVariant(active.status)} className="capitalize">{active.status}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {active.messages.map((m, i) => {
                    const mine = user && m.author === user.name;
                    return (
                      <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}>
                          <div className="text-[10px] opacity-70 mb-0.5">
                            {m.author} · {new Date(m.createdAt).toLocaleString()}
                          </div>
                          {m.body}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {active.status !== "closed" && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type a reply…"
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendReply(); }}
                    />
                    <Button onClick={handleSendReply}><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <NewTicketDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

function NewTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [resortId, setResortId] = useState<string>("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    ticketStore.create({
      user: { _id: user._id, name: user.name },
      subject: subject.trim(),
      body: body.trim(),
      resortId: resortId || undefined,
    });
    toast.success("Ticket opened");
    setSubject(""); setBody(""); setResortId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New support ticket</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Subject</Label>
            <Input required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>Related resort (optional)</Label>
            <Select value={resortId} onValueChange={setResortId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {demoResorts.map((r) => (
                  <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Open ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
