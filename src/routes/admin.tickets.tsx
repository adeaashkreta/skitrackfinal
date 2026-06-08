import { createFileRoute } from "@tanstack/react-router";
import { TicketsPanel } from "@/components/TicketsPanel";

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTicketsPage,
});

function AdminTicketsPage() {
  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground text-sm">Global inbox across all resorts.</p>
      </div>
      <TicketsPanel scope="admin" />
    </div>
  );
}
