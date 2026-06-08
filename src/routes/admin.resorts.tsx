import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resortsApi, type Resort, type ResortInput } from "@/lib/api";
import { demoResorts } from "@/lib/demoData";

export const Route = createFileRoute("/admin/resorts")({
  component: ManageResortsPage,
});

const emptyForm: ResortInput = {
  name: "", location: "", description: "", pricePerDay: 100,
  difficulty: "Intermediate", image: "", rating: 4.5,
};

function ManageResortsPage() {
  const [resorts, setResorts] = useState<Resort[]>(demoResorts);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResortInput>(emptyForm);

  useEffect(() => {
    resortsApi.list().then((d) => Array.isArray(d) && d.length && setResorts(d)).catch(() => {});
  }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };
  const openEdit = (r: Resort) => {
    setForm({ name: r.name, location: r.location, description: r.description, pricePerDay: r.pricePerDay, difficulty: r.difficulty, image: r.image, rating: r.rating });
    setEditingId(r._id); setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await resortsApi.update(editingId, form).catch(() => ({ _id: editingId, ...form }));
        setResorts((rs) => rs.map((r) => (r._id === editingId ? { ...r, ...updated } : r)));
        toast.success("Resort updated");
      } else {
        const created = await resortsApi.create(form).catch(() => ({ _id: `r${Date.now()}`, ...form }));
        setResorts((rs) => [created, ...rs]);
        toast.success("Resort added");
      }
      setOpen(false);
    } catch { toast.error("Save failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resort?")) return;
    try { await resortsApi.remove(id); } catch {}
    setResorts((rs) => rs.filter((r) => r._id !== id));
    toast.success("Resort deleted");
  };

  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Resorts</h1>
          <p className="text-muted-foreground text-sm">{resorts.length} total</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add resort</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Location</TableHead>
            <TableHead>Price</TableHead><TableHead>Difficulty</TableHead>
            <TableHead>Rating</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {resorts.map((r) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.location}</TableCell>
                <TableCell>${r.pricePerDay}/day</TableCell>
                <TableCell>{r.difficulty}</TableCell>
                <TableCell>{r.rating.toFixed(1)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(r._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit resort" : "Add resort"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Location</Label><Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Image URL</Label><Input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Price/day</Label><Input type="number" required value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} /></div>
              <div><Label>Rating</Label><Input type="number" step="0.1" min={0} max={5} required value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as ResortInput["difficulty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Save changes" : "Create resort"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
