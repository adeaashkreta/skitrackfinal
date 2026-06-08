import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";

import type { Resort } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function nightsBetween(range?: DateRange) {
  if (!range?.from || !range?.to) return 0;
  const ms = range.to.getTime() - range.from.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function BookNowDialog({
  resort,
  open,
  onOpenChange,
  defaultRange,
  defaultGuests,
}: {
  resort: Resort;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultRange?: DateRange;
  defaultGuests?: number;
}) {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange);
  const [guests, setGuests] = useState(defaultGuests ?? 2);
  const [step, setStep] = useState<"dates" | "price">("dates");

  const nights = nightsBetween(range);
  const canContinue = nights > 0 && guests > 0;
  const total = nights * guests * resort.pricePerDay;

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("dates");
    }
    onOpenChange(v);
  };

  const handleConfirm = () => {
    toast.success(`Booking confirmed at ${resort.name}`, {
      description: `${nights} night${nights > 1 ? "s" : ""} · ${guests} guest${guests > 1 ? "s" : ""} · $${total}`,
    });
    handleClose(false);
    setRange(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Book {resort.name}</DialogTitle>
          <DialogDescription>{resort.location}</DialogDescription>
        </DialogHeader>

        {step === "dates" ? (
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" /> Select your dates
              </div>
              <div className="rounded-lg border border-border p-2 flex justify-center">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                  className="pointer-events-auto"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" /> Guests
              </label>
              <Input
                type="number"
                min={1}
                max={12}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              {canContinue
                ? `${nights} night${nights > 1 ? "s" : ""} selected — continue to see pricing.`
                : "Select your dates to see pricing."}
            </div>

            <Button
              className="w-full"
              disabled={!canContinue}
              onClick={() => setStep("price")}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Check-in</span>
                <span className="text-foreground">{range?.from?.toDateString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Check-out</span>
                <span className="text-foreground">{range?.to?.toDateString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Guests</span>
                <span className="text-foreground">{guests}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-muted-foreground">
                <span>
                  ${resort.pricePerDay} × {nights} night{nights > 1 ? "s" : ""} × {guests} guest
                  {guests > 1 ? "s" : ""}
                </span>
                <span className="text-foreground">${total}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-1">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("dates")}>
                Back to dates
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
