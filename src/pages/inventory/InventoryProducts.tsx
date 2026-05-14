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
import { Plus, Search, Pencil, Trash2, Loader2, Package, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  sale_price: number;
  reorder_level: number;
  notes: string | null;
  is_active: boolean;
}

interface Row extends Product { stock: number; }

const empty: Partial<Product> = { name: "", sku: "", category: "", unit: "unit", sale_price: 0, reorder_level: 0, notes: "", is_active: true };

export default function InventoryProducts() {
  const { clinicId, loading: cLoading } = useClinicId();
  const { toast } = useToast();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cLoading || !clinicId) return;
    void load();
    // eslint-disable-next-line
  }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const [pRes, bRes] = await Promise.all([
      supabase.from("inventory_products").select("*").eq("clinic_id", clinicId!).order("name"),
      supabase.from("inventory_batches").select("product_id, quantity_on_hand").eq("clinic_id", clinicId!),
    ]);
    if (pRes.error) toast({ title: "Error", description: pRes.error.message, variant: "destructive" });
    const stockMap: Record<string, number> = {};
    (bRes.data ?? []).forEach((b: any) => { stockMap[b.product_id] = (stockMap[b.product_id] ?? 0) + Number(b.quantity_on_hand); });
    setItems(((pRes.data ?? []) as Product[]).map((p) => ({ ...p, stock: stockMap[p.id] ?? 0 })));
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.name, i.sku, i.category].some((v) => (v ?? "").toLowerCase().includes(q)));
  }, [items, search]);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm(p); setOpen(true); };

  const save = async () => {
    if (!form.name?.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      clinic_id: clinicId,
      name: form.name?.trim(),
      sku: form.sku?.trim() || null,
      category: form.category?.trim() || null,
      unit: form.unit?.trim() || "unit",
      sale_price: Number(form.sale_price ?? 0),
      reorder_level: Number(form.reorder_level ?? 0),
      notes: form.notes?.trim() || null,
      is_active: form.is_active ?? true,
    };
    const { error } = editing
      ? await supabase.from("inventory_products").update(payload).eq("id", editing.id)
      : await supabase.from("inventory_products").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editing ? "Updated" : "Created" });
    setOpen(false);
    void load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"? This will also remove related batches and ledger entries.`)) return;
    const { error } = await supabase.from("inventory_products").delete().eq("id", p.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-indigo-600" />Products</h1>
          <p className="text-sm text-muted-foreground">Medicines & consumables you sell</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, SKU, category…" className="pl-9" />
          </div>

          {loading ? (
            <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No products yet.</div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead className="text-right">Reorder</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const low = p.reorder_level > 0 && p.stock <= p.reorder_level;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.sku ?? "—"}</TableCell>
                        <TableCell>{p.category ?? "—"}</TableCell>
                        <TableCell>{p.unit}</TableCell>
                        <TableCell className="text-right">Rs {Number(p.sale_price).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{p.reorder_level || "—"}</TableCell>
                        <TableCell className={`text-right font-semibold ${low ? "text-rose-600" : ""}`}>{p.stock}</TableCell>
                        <TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(p)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>SKU</Label><Input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Antibiotic" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Unit</Label><Input value={form.unit ?? "unit"} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="tablet, ml, bottle" /></div>
              <div><Label>Sale Price (Rs)</Label><Input type="number" min={0} step="0.01" value={form.sale_price ?? 0} onChange={(e) => setForm({ ...form, sale_price: Number(e.target.value) })} /></div>
              <div><Label>Reorder Level</Label><Input type="number" min={0} step="1" value={form.reorder_level ?? 0} onChange={(e) => setForm({ ...form, reorder_level: Number(e.target.value) })} /></div>
            </div>
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
