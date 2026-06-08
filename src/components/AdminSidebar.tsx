import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Mountain, CalendarCheck, Users, MessageSquare, ArrowLeft } from "lucide-react";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/resorts", label: "Resorts", icon: Mountain, exact: false },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck, exact: false },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
  { to: "/admin/tickets", label: "Support", icon: MessageSquare, exact: false },
] as const;


export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Mountain className="h-5 w-5 text-primary" />
          SkiTrack Admin
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-medium"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
