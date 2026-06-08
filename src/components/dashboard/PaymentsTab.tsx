import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CreditCard, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { paymentsStore, detectBrand, type SavedCard } from "@/lib/paymentsStore";

export function PaymentsTab() {
  const [cards, setCards] = useState<SavedCard[]>(paymentsStore.list());
  useEffect(() => paymentsStore.subscribe(() => setCards(paymentsStore.list())), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Payment methods</h2>
          <p className="text-sm text-muted-foreground">Demo only — no real charges are made.</p>
        </div>
        <AddCardDialog />
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <CreditCard className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No cards saved yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{c.brand}</div>
                  <div className="font-mono text-lg tracking-widest">•••• {c.last4}</div>
                </div>
                {c.isDefault && <Badge>Default</Badge>}
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>{c.holder}</span>
                <span>{String(c.expMonth).padStart(2, "0")}/{String(c.expYear).slice(-2)}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                {!c.isDefault && (
                  <Button size="sm" variant="outline" onClick={() => paymentsStore.setDefault(c.id)}>
                    <Star className="h-3.5 w-3.5 mr-1" />Make default
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => {
                  paymentsStore.remove(c.id);
                  toast.success("Card removed");
                }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardSchema = z.object({
  holder: z.string().trim().min(2).max(80),
  number: z.string().regex(/^\d{13,19}$/, "Card number must be 13-19 digits"),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(new Date().getFullYear() % 100).max(99),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3-4 digits"),
});

function AddCardDialog() {
  const [open, setOpen] = useState(false);
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = number.replace(/\s/g, "");
    const [mm, yy] = exp.split("/").map((s) => s.trim());
    const parsed = cardSchema.safeParse({
      holder, number: num, expMonth: Number(mm), expYear: Number(yy), cvc,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    paymentsStore.add({
      holder,
      brand: detectBrand(num),
      last4: num.slice(-4),
      expMonth: parsed.data.expMonth,
      expYear: 2000 + parsed.data.expYear,
    });
    toast.success("Card added");
    setOpen(false);
    setHolder(""); setNumber(""); setExp(""); setCvc("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" />Add card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a card</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Cardholder name</Label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} maxLength={80} placeholder="Jane Doe" />
          </div>
          <div>
            <Label>Card number</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="4242 4242 4242 4242" inputMode="numeric" maxLength={23} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Expiry (MM/YY)</Label>
              <Input value={exp} onChange={(e) => setExp(e.target.value)} placeholder="12/29" maxLength={5} />
            </div>
            <div>
              <Label>CVC</Label>
              <Input value={cvc} onChange={(e) => setCvc(e.target.value)} maxLength={4} inputMode="numeric" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Save card</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
