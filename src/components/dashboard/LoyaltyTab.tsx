import { Sparkles, Trophy } from "lucide-react";
import type { Booking, Resort } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTier, pointsForBooking, totalPoints } from "@/lib/loyaltyStore";

export function LoyaltyTab({ bookings }: { bookings: Booking[] }) {
  const points = totalPoints(bookings);
  const { current, next, allTiers } = getTier(points);
  const progress = next ? Math.min(100, ((points - current.min) / (next.min - current.min)) * 100) : 100;

  const activity = bookings
    .filter((b) => pointsForBooking(b) > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" /> Current tier
            </div>
            <div className="text-3xl font-bold mt-1">{current.tier}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" /> Points balance
            </div>
            <div className="text-3xl font-bold mt-1">{points.toLocaleString()}</div>
          </div>
        </div>

        {next ? (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{current.tier}</span>
              <span>{(next.min - points).toLocaleString()} pts to {next.tier}</span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">You've reached the top tier. Enjoy the perks!</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">Tiers & perks</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allTiers.map((t) => (
            <div
              key={t.tier}
              className={`rounded-2xl border p-4 ${t.tier === current.tier ? "border-primary bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.tier}</div>
                {t.tier === current.tier && <Badge>Current</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mt-1">From {t.min.toLocaleString()} pts</div>
              <ul className="mt-3 text-sm space-y-1.5 list-disc list-inside text-muted-foreground">
                {t.perks.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Recent activity</h3>
        {activity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            No points earned yet — book a trip to start earning.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resort</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Spend</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activity.map((b) => {
                  const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
                  return (
                    <TableRow key={b._id}>
                      <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                      <TableCell>{b.startDate}</TableCell>
                      <TableCell>${b.totalPrice}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        +{pointsForBooking(b).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
