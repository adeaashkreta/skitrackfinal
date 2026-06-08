import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi, type Role, type User } from "@/lib/api";
import { demoUsers } from "@/lib/demoData";

export const Route = createFileRoute("/admin/users")({
  component: ManageUsersPage,
});

const roleLabel: Record<Role, string> = {
  user: "User",
  resort_manager: "Manager",
  super_admin: "Admin",
};

function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(demoUsers);

  useEffect(() => {
    adminApi.users().then((d) => Array.isArray(d) && setUsers(d)).catch(() => {});
  }, []);

  const handleRoleChange = async (id: string, role: Role) => {
    try { await adminApi.updateUser(id, { role }); } catch {}
    setUsers((us) => us.map((u) => (u._id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try { await adminApi.deleteUser(id); } catch {}
    setUsers((us) => us.filter((u) => u._id !== id));
    toast.success("User deleted");
  };

  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground text-sm">{users.length} total</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead>
            <TableHead>Role</TableHead><TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "super_admin" ? "default" : u.role === "resort_manager" ? "secondary" : "outline"}>
                    {roleLabel[u.role]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Select value={u.role} onValueChange={(v) => handleRoleChange(u._id, v as Role)}>
                    <SelectTrigger className="w-36 inline-flex"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="resort_manager">Manager</SelectItem>
                      <SelectItem value="super_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(u._id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
