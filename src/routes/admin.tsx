import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminSidebar } from "@/components/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen flex bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
