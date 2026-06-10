import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const paymentSchema = z.object({
  holder: z.string().trim().min(2, "Cardholder name is required").max(80),
  number: z.string().regex(/^\d{13,19}$/, "Card number must be 13-19 digits"),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(new Date().getFullYear() % 100).max(99),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3-4 digits"),
});

type PaymentCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPrice: number;
  resortName: string;
  onPaySuccess: () => void | Promise<void>;
};

export function PaymentCheckoutDialog({
  open,
  onOpenChange,
  totalPrice,
  resortName,
  onPaySuccess,
}: PaymentCheckoutDialogProps) {
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [paying, setPaying] = useState(false);

  const resetForm = () => {
    setHolder("");
    setNumber("");
    setExp("");
    setCvc("");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setNumber(formatted.slice(0, 19));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const num = number.replace(/\s/g, "");
    const [mm, yy] = exp.split("/").map((s) => s.trim());

    const parsed = paymentSchema.safeParse({
      holder,
      number: num,
      expMonth: Number(mm),
      expYear: Number(yy),
      cvc,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    try {
      setPaying(true);
      await onPaySuccess();
      resetForm();
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mock payment
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-sm text-muted-foreground">Reservation for</p>
          <p className="font-semibold">{resortName}</p>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total amount</span>
            <span className="text-2xl font-bold">
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Cardholder name</Label>
            <Input
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              maxLength={80}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <Label>Card number</Label>
            <Input
              value={number}
              onChange={handleNumberChange}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Expiry (MM/YY)</Label>
              <Input
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                placeholder="12/29"
                maxLength={5}
              />
            </div>

            <div>
              <Label>CVC</Label>
              <Input
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                maxLength={4}
                inputMode="numeric"
              />
            </div>
          </div>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Demo only — no real charge is made.
          </p>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={paying}>
              {paying ? "Processing..." : "Paguaj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}