import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookingsApi, type Booking, type Resort } from "@/lib/api";
import { demoBookings, demoResorts } from "@/lib/demoData";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/manager/bookings")({
  component: ManagerBookingsPage,
});

function ManagerBookingsPage() {
  const { user } = useAuth();
  const myResortIds = new Set(demoResorts.filter((r) => r.managerId === user?._id).map((r) => r._id));
  const [bookings, setBookings] = useState<Booking[]>(
    demoBookings.filter((b) => {
      const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
      return r ? myResortIds.has(r._id) : false;
    }),
  );

  useEffect(() => {
    bookingsApi.forManager().then((d) => Array.isArray(d) && setBookings(d)).catch(() => {});
  }, []);

  const update = (id: string, patch: Partial<Booking>) =>
    setBookings((bs) => bs.map((b) => (b._id === id ? { ...b, ...patch } : b)));

  const handleConfirm = async (id: string) => {
    try { await bookingsApi.confirm(id); } catch {}
    update(id, { status: "confirmed" });
    toast.success("Booking confirmed");
  };
  const handleCancel = async (id: string) => {
    try { await bookingsApi.cancel(id); } catch {}
    update(id, { status: "cancelled" });
    toast.success("Booking cancelled");
  };

  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <p className="text-muted-foreground text-sm">{bookings.length} across your resorts</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Resort</TableHead><TableHead>Dates</TableHead>
            <TableHead>Guests</TableHead><TableHead>Total</TableHead>
            <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
              return (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                  <TableCell>{b.startDate} → {b.endDate}</TableCell>
                  <TableCell>{b.guests}</TableCell>
                  <TableCell>${b.totalPrice}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{b.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {b.status === "pending" && (
                      <Button size="sm" onClick={() => handleConfirm(b._id)}>Confirm</Button>
                    )}
                    {b.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => handleCancel(b._id)}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {bookings.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No reservations yet.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
