import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { ticketStore } from "@/lib/ticketStore";
import { ticketsApi, type Resort } from "@/lib/api";

const schema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(120),
  body: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

export function ContactResortDialog({
  resort,
  open,
  onOpenChange,
}: {
  resort: Resort;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to contact the resort");
      onOpenChange(false);
      return;
    }
    const parsed = schema.safeParse({ subject, body });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    ticketStore.create({
      user: { _id: user._id, name: user.name },
      subject: parsed.data.subject,
      body: parsed.data.body,
      resortId: resort._id,
    });
    ticketsApi.create({ subject: parsed.data.subject, body: parsed.data.body, resortId: resort._id }).catch(() => {});
    toast.success("Message sent — the resort will reply in your Support tab");
    setSubject("");
    setBody("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Contact {resort.name}
          </DialogTitle>
          <DialogDescription>Usually replies within 24 hours.</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to send a message to this resort.</p>
            <Button asChild className="w-full">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                placeholder="Question about availability"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Hi, I'd like to ask about…"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">{body.length}/1000</div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Send message</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
