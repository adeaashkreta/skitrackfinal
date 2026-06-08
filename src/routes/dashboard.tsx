import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookingsApi, type Booking, type Resort } from "@/lib/api";
import { demoBookings } from "@/lib/demoData";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays } from "lucide-react";
import { TicketsPanel } from "@/components/TicketsPanel";
import { OverviewHeader } from "@/components/dashboard/OverviewHeader";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { PaymentsTab } from "@/components/dashboard/PaymentsTab";
import { LoyaltyTab } from "@/components/dashboard/LoyaltyTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { ticketStore } from "@/lib/ticketStore";
import { favoritesStore } from "@/lib/favoritesStore";
import { totalPoints, getTier } from "@/lib/loyaltyStore";

export const Route = createFileRoute("/dashboard")({
  component: DashboardWrapper,
});

function DashboardWrapper() {
  return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
}

function statusVariant(s: Booking["status"]) {
  if (s === "confirmed") return "default";
  if (s === "pending") return "secondary";
  return "destructive";
}

function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(demoBookings);
  const [tab, setTab] = useState("bookings");
  const [openTickets, setOpenTickets] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    bookingsApi.my().then((d) => Array.isArray(d) && setBookings(d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const refreshTickets = () =>
      setOpenTickets(ticketStore.forUser(user._id).filter((t) => t.status !== "closed").length);
    refreshTickets();
    if (typeof window !== "undefined") {
      window.addEventListener("tickets:changed", refreshTickets);
      return () => window.removeEventListener("tickets:changed", refreshTickets);
    }
  }, [user]);

  useEffect(() => {
    const refresh = () => setFavCount(favoritesStore.list().length);
    refresh();
    return favoritesStore.subscribe(refresh);
  }, []);

  const handleCancel = async (id: string) => {
    try { await bookingsApi.cancel(id); } catch {}
    setBookings((b) => b.map((x) => (x._id === id ? { ...x, status: "cancelled" } : x)));
    toast.success("Booking cancelled");
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.endDate >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.endDate < today || b.status === "cancelled");

  const points = totalPoints(bookings);
  const { current } = getTier(points);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10">
        <OverviewHeader
          userName={user?.name ?? "there"}
          bookings={bookings}
          openTickets={openTickets}
          loyaltyPoints={points}
          tier={current.tier}
          favoritesCount={favCount}
          onTabChange={setTab}
        />

        <Tabs value={tab} onValueChange={setTab} className="mt-10">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="bookings">Reservations</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            <TabsTrigger value="tickets">Support</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6 space-y-8">
            <BookingsTable title="Upcoming" rows={upcoming} onCancel={handleCancel} emptyHint="No upcoming trips yet." />
            <BookingsTable title="Past & cancelled" rows={past} onCancel={handleCancel} emptyHint="No past trips." hideActions />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6"><FavoritesTab /></TabsContent>
          <TabsContent value="payments" className="mt-6"><PaymentsTab /></TabsContent>
          <TabsContent value="loyalty" className="mt-6"><LoyaltyTab bookings={bookings} /></TabsContent>
          <TabsContent value="tickets" className="mt-6"><TicketsPanel scope="user" /></TabsContent>
          <TabsContent value="profile" className="mt-6"><ProfileTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingsTable({
  title, rows, onCancel, emptyHint, hideActions,
}: {
  title: string;
  rows: Booking[];
  onCancel: (id: string) => void;
  emptyHint: string;
  hideActions?: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <CalendarDays className="h-7 w-7 mx-auto mb-2" />
          {emptyHint}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resort</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                {!hideActions && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => {
                const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
                return (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                    <TableCell>{b.startDate} → {b.endDate}</TableCell>
                    <TableCell>{b.guests}</TableCell>
                    <TableCell>${b.totalPrice}</TableCell>
                    <TableCell><Badge variant={statusVariant(b.status)} className="capitalize">{b.status}</Badge></TableCell>
                    {!hideActions && (
                      <TableCell className="text-right">
                        {b.status !== "cancelled" && (
                          <Button size="sm" variant="outline" onClick={() => onCancel(b._id)}>Cancel</Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
