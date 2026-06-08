import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, Mountain, MessageSquare, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { demoBookings, demoResorts } from "@/lib/demoData";
import { ticketStore } from "@/lib/ticketStore";
import type { Resort } from "@/lib/api";

export const Route = createFileRoute("/manager/")({
  component: ManagerOverview,
});

function ManagerOverview() {
  const { user } = useAuth();
  const [openTickets, setOpenTickets] = useState(0);

  const myResorts = demoResorts.filter((r) => r.managerId === user?._id);
  const myResortIds = new Set(myResorts.map((r) => r._id));
  const myBookings = demoBookings.filter((b) => {
    const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
    return r ? myResortIds.has(r._id) : false;
  });
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = myBookings.filter((b) => b.endDate >= today && b.status !== "cancelled");
  const revenue = myBookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);

  useEffect(() => {
    if (!user) return;
    const refresh = () =>
      setOpenTickets(ticketStore.forManager(user._id).filter((t) => t.status !== "closed").length);
    refresh();
    window.addEventListener("tickets:changed", refresh);
    return () => window.removeEventListener("tickets:changed", refresh);
  }, [user]);

  const cards = [
    { label: "My Listings", value: myResorts.length, icon: Mountain },
    { label: "Upcoming Bookings", value: upcoming.length, icon: CalendarCheck },
    { label: "Open Tickets", value: openTickets, icon: MessageSquare },
    { label: "Revenue", value: `$${revenue.toLocaleString()}`, icon: DollarSign },
  ];

  return (
    <div className="px-6 lg:px-12 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Manager Overview</h1>
        <p className="text-muted-foreground text-sm">Quick look at your resorts and reservations.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-3">Upcoming reservations</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming reservations at your resorts.</p>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Resort</TableHead><TableHead>Dates</TableHead>
              <TableHead>Guests</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {upcoming.map((b) => {
                const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
                return (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                    <TableCell>{b.startDate} → {b.endDate}</TableCell>
                    <TableCell>{b.guests}</TableCell>
                    <TableCell>${b.totalPrice}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{b.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
