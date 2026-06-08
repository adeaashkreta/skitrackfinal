import { createFileRoute } from "@tanstack/react-router";
import { TicketsPanel } from "@/components/TicketsPanel";

export const Route = createFileRoute("/manager/support")({
  component: ManagerSupportPage,
});

function ManagerSupportPage() {
  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground text-sm">Tickets opened for resorts you manage.</p>
      </div>
      <TicketsPanel scope="manager" />
    </div>
  );
}
