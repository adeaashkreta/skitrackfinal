import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ManagerSidebar } from "@/components/ManagerSidebar";

export const Route = createFileRoute("/manager")({
  component: ManagerLayout,
});

function ManagerLayout() {
  return (
    <ProtectedRoute roles={["resort_manager", "super_admin"]}>
      <div className="min-h-screen flex bg-background">
        <ManagerSidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
