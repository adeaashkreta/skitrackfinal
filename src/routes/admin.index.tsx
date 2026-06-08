import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, DollarSign, Users, Mountain, MessageSquare } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminApi, type Booking, type Resort } from "@/lib/api";
import { demoBookings, demoResorts, demoUsers } from "@/lib/demoData";
import { ticketStore } from "@/lib/ticketStore";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats { totalBookings: number; totalRevenue: number; totalUsers: number; activeResorts: number; openTickets: number; }

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: demoBookings.length,
    totalRevenue: demoBookings.reduce((s, b) => s + b.totalPrice, 0),
    totalUsers: demoUsers.length,
    activeResorts: demoResorts.length,
    openTickets: ticketStore.all().filter((t) => t.status !== "closed").length,
  });
  const [recent] = useState<Booking[]>(demoBookings);

  useEffect(() => {
    adminApi.stats().then((d) => d && setStats((s) => ({ ...s, ...d }))).catch(() => {});
    const refresh = () =>
      setStats((s) => ({ ...s, openTickets: ticketStore.all().filter((t) => t.status !== "closed").length }));
    window.addEventListener("tickets:changed", refresh);
    return () => window.removeEventListener("tickets:changed", refresh);
  }, []);

  const cards = [
    { label: "Total Bookings", value: stats.totalBookings, icon: CalendarCheck },
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Active Resorts", value: stats.activeResorts, icon: Mountain },
    { label: "Open Tickets", value: stats.openTickets, icon: MessageSquare },
  ];

  const chartData = [
    { month: "Sep", bookings: 8 }, { month: "Oct", bookings: 14 },
    { month: "Nov", bookings: 22 }, { month: "Dec", bookings: 35 },
    { month: "Jan", bookings: 41 }, { month: "Feb", bookings: 30 },
  ];


  return (
    <div className="px-6 lg:px-12 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your platform.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Bookings by month</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="oklch(0.55 0.16 240)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Recent bookings</h2>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Resort</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((b) => {
                const r = typeof b.resort === "object" ? (b.resort as Resort) : null;
                return (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">{r?.name ?? "Resort"}</TableCell>
                    <TableCell>${b.totalPrice}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{b.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
