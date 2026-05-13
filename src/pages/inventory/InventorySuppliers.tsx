import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Loader2, Truck } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

const empty: Partial<Supplier> = { name: "", contact_person: "", phone: "", email: "", address: "", notes: "", is_active: true };

export default function InventorySuppliers() {
  const { clinicId, loading: cLoading } = useClinicId();
  const { toast } = useToast();
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cLoading || !clinicId) return;
    void load();
    // eslint-disable-next-line
  }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory_suppliers")
      .select("*")
      .eq("clinic_id", clinicId!)
      .order("name");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setItems((data ?? []) as Supplier[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.contact_person, i.phone, i.email].some((v) => (v ?? "").toLowerCase().includes(q))
    );
  }, [items, search]);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setOpen(true); };

  const save = async () => {
    if (!form.name?.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      clinic_id: clinicId,
      name: form.name?.trim(),
      contact_person: form.contact_person?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
      notes: form.notes?.trim() || null,
      is_active: form.is_active ?? true,
    };
    const { error } = editing
      ? await supabase.from("inventory_suppliers").update(payload).eq("id", editing.id)
      : await supabase.from("inventory_suppliers").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created" });
    setOpen(false);
    void load();
  };

  const remove = async (s: Supplier) => {
    if (!confirm(`Delete supplier "${s.name}"?`)) return;
    const { error } = await supabase.from("inventory_suppliers").delete().eq("id", s.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-emerald-600" />Suppliers</h1>
          <p className="text-sm text-muted-foreground">Vendors you purchase medicines from</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add Supplier</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9" />
          </div>

          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No suppliers yet.</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.contact_person ?? "—"}</TableCell>
                      <TableCell>{s.phone ?? "—"}</TableCell>
                      <TableCell>{s.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? "Active" : "Inactive"}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(s)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "New Supplier"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Person</Label><Input value={form.contact_person ?? ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Address</Label><Textarea rows={2} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
