import { Link } from "@tanstack/react-router";
import { CalendarDays, Heart, LifeBuoy, MapPin, Plus, Sparkles, Ticket, Users } from "lucide-react";
import type { Booking, Resort } from "@/lib/api";
import { Button } from "@/components/ui/button";

function daysUntil(date: string): number {
  const d = new Date(date + "T00:00:00").getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();
  return Math.round((d - today) / 86400000);
}

function nights(start: string, end: string): number {
  return Math.max(
    0,
    Math.round(
      (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) / 86400000,
    ),
  );
}

export function OverviewHeader({
  userName,
  bookings,
  openTickets,
  loyaltyPoints,
  tier,
  favoritesCount,
  onTabChange,
}: {
  userName: string;
  bookings: Booking[];
  openTickets: number;
  loyaltyPoints: number;
  tier: string;
  favoritesCount: number;
  onTabChange: (tab: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((b) => b.endDate >= today && b.status !== "cancelled")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const next = upcoming[0];
  const nextResort = next && typeof next.resort === "object" ? (next.resort as Resort) : null;

  const totalNights = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + nights(b.startDate, b.endDate), 0);

  const stats = [
    { label: "Upcoming trips", value: upcoming.length, icon: CalendarDays },
    { label: "Nights booked", value: totalNights, icon: MapPin },
    { label: `Loyalty • ${tier}`, value: loyaltyPoints.toLocaleString(), icon: Sparkles },
    { label: "Open tickets", value: openTickets, icon: LifeBuoy },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hi, {userName} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's a quick look at your account.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/resorts"><Plus className="h-4 w-4 mr-1" />Book a trip</Link>
          </Button>
          <Button variant="outline" onClick={() => onTabChange("tickets")}>
            <Ticket className="h-4 w-4 mr-1" />New ticket
          </Button>
          <Button variant="outline" onClick={() => onTabChange("favorites")}>
            <Heart className="h-4 w-4 mr-1" />Favorites ({favoritesCount})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-wide">{s.label}</span>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
            </div>
          );
        })}
      </div>

      {next && nextResort ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid md:grid-cols-[2fr_3fr]">
            <div className="relative aspect-[4/3] md:aspect-auto bg-muted">
              <img src={nextResort.image} alt={nextResort.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute left-5 bottom-4 text-white">
                <div className="text-xs uppercase tracking-wider opacity-90">Your next trip</div>
                <div className="text-2xl font-semibold drop-shadow">{nextResort.name}</div>
                <div className="text-sm opacity-90 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {nextResort.location}
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">
                  {daysUntil(next.startDate) <= 0 ? "Happening now" : `In ${daysUntil(next.startDate)} days`}
                </span>
                <span className="text-muted-foreground capitalize">• {next.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Check-in</div>
                  <div className="font-medium">{next.startDate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Check-out</div>
                  <div className="font-medium">{next.endDate}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Guests</div>
                  <div className="font-medium flex items-center gap-1"><Users className="h-3.5 w-3.5" />{next.guests}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Total</div>
                  <div className="font-medium">${next.totalPrice}</div>
                </div>
              </div>
              <div className="mt-auto flex gap-2 pt-2">
                <Button asChild>
                  <Link to="/resorts/$id" params={{ id: nextResort._id }}>View resort</Link>
                </Button>
                <Button variant="outline" onClick={() => onTabChange("bookings")}>All reservations</Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <CalendarDays className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No upcoming trips. Time to plan your next escape.</p>
          <Button asChild><Link to="/resorts">Browse resorts</Link></Button>
        </div>
      )}
    </div>
  );
}
