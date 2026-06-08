import { useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Minus, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type Flexibility = "exact" | 1 | 2 | 3 | 7;

export type ResortsSearchValue = {
  range?: DateRange;
  adults: number;
  children: number;
  rooms: number;
  flexibility?: Flexibility;
  pets?: boolean;
};

const FLEX_OPTIONS: { value: Flexibility; label: string }[] = [
  { value: "exact", label: "Exact dates" },
  { value: 1, label: "± 1 day" },
  { value: 2, label: "± 2 days" },
  { value: 3, label: "± 3 days" },
  { value: 7, label: "± 7 days" },
];

const STAY_OPTIONS = ["Weekend", "Week", "Month"];

export function ResortsSearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: ResortsSearchValue;
  onChange: (v: ResortsSearchValue) => void;
  onSearch?: () => void;
}) {
  const { range, adults, children, rooms, flexibility = "exact", pets = false } = value;
  const [guestsOpen, setGuestsOpen] = useState(false);

  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, "EEE, MMM d")} — ${format(range.to, "MMM d")}`
      : range?.from
        ? `${format(range.from, "EEE, MMM d")} — Select`
        : "Select dates";

  const guestLabel = `${adults} adult${adults === 1 ? "" : "s"} · ${children} child${
    children === 1 ? "" : "ren"
  }`;

  const upcomingMonths = Array.from({ length: 6 }, (_, i) =>
    startOfMonth(addMonths(new Date(), i)),
  );

  return (
    <div className="bg-primary p-0.5 flex flex-col md:flex-row gap-px rounded-xl">
      {/* Dates */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex-1 flex items-center gap-3 px-5 py-4 text-left bg-background rounded-lg md:rounded-r-none hover:bg-muted/40 transition-colors min-w-0">
            <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <span
              className={cn(
                "truncate text-sm font-medium",
                !range?.from && "text-muted-foreground font-normal",
              )}
            >
              {dateLabel}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Tabs defaultValue="calendar" className="w-auto">
            <TabsList className="w-full grid grid-cols-2 rounded-none rounded-t-md bg-transparent border-b h-auto p-0">
              <TabsTrigger
                value="calendar"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none py-3 font-semibold"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="flexible"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none py-3 font-semibold"
              >
                I'm flexible
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-0 p-3">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => onChange({ ...value, range: r })}
                numberOfMonths={2}
                disabled={{ before: new Date() }}
                initialFocus
                className="pointer-events-auto"
              />
              <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                {FLEX_OPTIONS.map((opt) => {
                  const active = flexibility === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => onChange({ ...value, flexibility: opt.value })}
                      className={cn(
                        "text-sm px-4 py-1.5 rounded-full border transition-colors",
                        active
                          ? "border-primary text-primary font-medium"
                          : "border-border text-foreground hover:bg-muted",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="flexible" className="mt-0 p-5 w-[420px]">
              <div>
                <p className="text-sm font-semibold mb-3">How long do you want to stay?</p>
                <div className="flex flex-wrap gap-2">
                  {STAY_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="text-sm px-4 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      A {s.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-sm font-semibold mb-3">When do you want to go?</p>
                <div className="grid grid-cols-3 gap-2">
                  {upcomingMonths.map((m) => (
                    <button
                      key={m.toISOString()}
                      type="button"
                      className="text-sm px-3 py-3 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors text-center"
                    >
                      <div className="font-medium">{format(m, "MMMM")}</div>
                      <div className="text-xs text-muted-foreground">{format(m, "yyyy")}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      {/* Guests */}
      <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
        <PopoverTrigger asChild>
          <button className="flex-1 flex items-center gap-3 px-5 py-4 text-left bg-background rounded-lg md:rounded-none hover:bg-muted/40 transition-colors min-w-0">
            <User className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="truncate text-sm font-medium">{guestLabel}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-5" align="start">
          <div className="space-y-4">
            <Stepper
              label="Adults"
              value={adults}
              min={1}
              max={20}
              onChange={(n) => onChange({ ...value, adults: n })}
            />
            <Stepper
              label="Children"
              value={children}
              min={0}
              max={10}
              onChange={(n) => onChange({ ...value, children: n })}
            />
            <Stepper
              label="Rooms"
              value={rooms}
              min={1}
              max={10}
              onChange={(n) => onChange({ ...value, rooms: n })}
            />
          </div>

          <div className="mt-5 pt-5 border-t">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-medium">Traveling with pets?</span>
              <Switch
                checked={pets}
                onCheckedChange={(c) => onChange({ ...value, pets: c })}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Assistance animals aren't considered pets.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="mt-1 inline-block text-xs text-primary hover:underline"
            >
              Read more about traveling with assistance animals
            </a>
          </div>

          <Button
            variant="outline"
            className="w-full mt-5 border-primary text-primary hover:bg-primary/5 hover:text-primary font-semibold"
            onClick={() => setGuestsOpen(false)}
          >
            Done
          </Button>
        </PopoverContent>
      </Popover>

      {/* Search button */}
      <Button
        size="lg"
        className="rounded-lg md:rounded-l-none h-auto px-8 py-4 md:w-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        onClick={onSearch}
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
