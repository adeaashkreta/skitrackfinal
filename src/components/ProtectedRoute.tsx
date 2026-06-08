import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/api";

export function ProtectedRoute({
  children,
  adminOnly = false,
  roles,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "super_admin") return <Navigate to="/" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}
