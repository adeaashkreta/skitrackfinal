import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookingsApi, type Booking, type Resort, type User } from "@/lib/api";
import { demoBookings } from "@/lib/demoData";

export const Route = createFileRoute("/admin/bookings")({
  component: ManageBookingsPage,
});

function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(demoBookings);

  useEffect(() => {
    bookingsApi.all().then((d) => Array.isArray(d) && setBookings(d)).catch(() => {});
  }, []);

  const handleCancel = async (id: string) => {
    try { await bookingsApi.cancel(id); } catch {}
    setBookings((bs) => bs.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)));
    toast.success("Booking cancelled");
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try { await bookingsApi.remove(id); } catch {}
    setBookings((bs) => bs.filter((b) => b._id !== id));
    toast.success("Booking deleted");
  };

  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground text-sm">{bookings.length} total</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>User</TableHead><TableHead>Resort</TableHead>
            <TableHead>Dates</TableHead><TableHead>Guests</TableHead>
            <TableHead>Total</TableHead><TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
              const u = typeof b.user === "object" ? (b.user as User) : null;
              return (
                <TableRow key={b._id}>
                  <TableCell>{u?.name ?? (typeof b.user === "string" ? b.user : "—")}</TableCell>
                  <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                  <TableCell>{b.startDate} → {b.endDate}</TableCell>
                  <TableCell>{b.guests}</TableCell>
                  <TableCell>${b.totalPrice}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{b.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {b.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => handleCancel(b._id)}>Cancel</Button>}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(b._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
