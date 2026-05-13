import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, Trash2, Save, CheckCircle2, XCircle, Send } from "lucide-react";

interface PO {
  id: string; clinic_id: string; po_number: string; status: string;
  supplier_id: string | null; order_date: string; expected_date: string | null;
  received_date: string | null; subtotal: number; tax: number; discount: number;
  total: number; notes: string | null;
}
interface POItem { id?: string; product_id: string; quantity: number; unit_cost: number; line_total: number; batch_number?: string | null; expiry_date?: string | null; }
interface Product { id: string; name: string; unit: string; sale_price: number; }
interface Supplier { id: string; name: string; }

export default function InventoryPurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { toast } = useToast();
  const { clinicId } = useClinicId();
  const [po, setPo] = useState<PO | null>(null);
  const [items, setItems] = useState<POItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (id) void load(); /* eslint-disable-next-line */ }, [id]);

  const load = async () => {
    setLoading(true);
    const [poRes, itemsRes, prodRes, supRes] = await Promise.all([
      supabase.from("inventory_purchase_orders").select("*").eq("id", id!).single(),
      supabase.from("inventory_purchase_order_items").select("*").eq("po_id", id!).order("created_at"),
      supabase.from("inventory_products").select("id, name, unit, sale_price").eq("is_active", true).order("name"),
      supabase.from("inventory_suppliers").select("id, name").eq("is_active", true).order("name"),
    ]);
    if (poRes.error) { toast({ title: "Error", description: poRes.error.message, variant: "destructive" }); nav("/clinic/inventory/purchase-orders"); return; }
    setPo(poRes.data as PO);
    setItems((itemsRes.data ?? []) as POItem[]);
    setProducts((prodRes.data ?? []) as Product[]);
    setSuppliers((supRes.data ?? []) as Supplier[]);
    setLoading(false);
  };

  const editable = po?.status === "draft";
  const canReceive = po?.status === "ordered";
  const canCancel = po && (po.status === "draft" || po.status === "ordered");

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0);
    const tax = Number(po?.tax ?? 0);
    const discount = Number(po?.discount ?? 0);
    return { subtotal, total: subtotal + tax - discount };
  }, [items, po?.tax, po?.discount]);

  const updatePo = (patch: Partial<PO>) => setPo((p) => p ? { ...p, ...patch } : p);

  const addRow = () => setItems([...items, { product_id: "", quantity: 1, unit_cost: 0, line_total: 0 }]);
  const updateRow = (idx: number, patch: Partial<POItem>) => {
    const next = items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      merged.line_total = Number(merged.quantity || 0) * Number(merged.unit_cost || 0);
      return merged;
    });
    setItems(next);
  };
  const removeRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const save = async () => {
    if (!po) return;
    if (items.some((it) => !it.product_id || Number(it.quantity) <= 0)) {
      toast({ title: "Each line needs a product and quantity > 0", variant: "destructive" }); return;
    }
    setSaving(true);

    const { error: upErr } = await supabase.from("inventory_purchase_orders").update({
      supplier_id: po.supplier_id,
      order_date: po.order_date,
      expected_date: po.expected_date,
      tax: Number(po.tax || 0),
      discount: Number(po.discount || 0),
      subtotal: totals.subtotal,
      total: totals.total,
      notes: po.notes,
    }).eq("id", po.id);
    if (upErr) { setSaving(false); toast({ title: "Error", description: upErr.message, variant: "destructive" }); return; }

    // Replace items
    await supabase.from("inventory_purchase_order_items").delete().eq("po_id", po.id);
    if (items.length) {
      const payload = items.map((it) => ({
        po_id: po.id,
        product_id: it.product_id,
        quantity: Number(it.quantity),
        unit_cost: Number(it.unit_cost),
        line_total: Number(it.quantity) * Number(it.unit_cost),
        batch_number: it.batch_number || null,
        expiry_date: it.expiry_date || null,
      }));
      const { error: itErr } = await supabase.from("inventory_purchase_order_items").insert(payload);
      if (itErr) { setSaving(false); toast({ title: "Error", description: itErr.message, variant: "destructive" }); return; }
    }
    setSaving(false);
    toast({ title: "Saved" });
    void load();
  };

  const markOrdered = async () => {
    if (items.length === 0) { toast({ title: "Add items first", variant: "destructive" }); return; }
    await save();
    setBusy(true);
    const { error } = await supabase.from("inventory_purchase_orders").update({ status: "ordered" }).eq("id", po!.id);
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Marked as Ordered" });
    void load();
  };

  const receive = async () => {
    if (!confirm("Receive this PO? Stock batches will be created and inventory updated. This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.rpc("receive_purchase_order", { _po_id: po!.id });
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "PO received — stock updated" });
    void load();
  };

  const cancel = async () => {
    if (!confirm("Cancel this PO?")) return;
    setBusy(true);
    const { error } = await supabase.from("inventory_purchase_orders").update({ status: "cancelled" }).eq("id", po!.id);
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "PO cancelled" });
    void load();
  };

  if (loading || !po) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm"><Link to="/clinic/inventory/purchase-orders"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-xl font-bold font-mono">{po.po_number}</h1>
            <div className="text-xs">Status: <span className="font-semibold uppercase">{po.status}</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {editable && <Button variant="outline" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save Draft</>}</Button>}
          {editable && <Button onClick={markOrdered} disabled={busy || saving}><Send className="h-4 w-4 mr-1" />Mark as Ordered</Button>}
          {canReceive && <Button onClick={receive} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4 mr-1" />Receive Stock</Button>}
          {canCancel && <Button variant="outline" onClick={cancel} disabled={busy} className="text-rose-600"><XCircle className="h-4 w-4 mr-1" />Cancel</Button>}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Supplier</Label>
            <Select disabled={!editable} value={po.supplier_id ?? "none"} onValueChange={(v) => updatePo({ supplier_id: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— none —</SelectItem>
                {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Order Date</Label><Input type="date" disabled={!editable} value={po.order_date} onChange={(e) => updatePo({ order_date: e.target.value })} /></div>
          <div><Label>Expected Date</Label><Input type="date" disabled={!editable} value={po.expected_date ?? ""} onChange={(e) => updatePo({ expected_date: e.target.value || null as any })} /></div>
          <div className="md:col-span-3"><Label>Notes</Label><Textarea rows={2} disabled={!editable} value={po.notes ?? ""} onChange={(e) => updatePo({ notes: e.target.value })} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Items</CardTitle>
          {editable && <Button size="sm" onClick={addRow}><Plus className="h-4 w-4 mr-1" />Add Line</Button>}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Cost (Rs)</TableHead>
                <TableHead className="w-40">Batch #</TableHead>
                <TableHead className="w-40">Expiry</TableHead>
                <TableHead className="text-right w-32">Line Total</TableHead>
                {editable && <TableHead className="w-12"></TableHead>}
              </TableRow></TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={editable ? 7 : 6} className="text-center text-muted-foreground py-6">No items.</TableCell></TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Select disabled={!editable} value={it.product_id} onValueChange={(v) => updateRow(idx, { product_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input type="number" min={0} step="1" disabled={!editable} value={it.quantity} onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })} /></TableCell>
                    <TableCell><Input type="number" min={0} step="0.01" disabled={!editable} value={it.unit_cost} onChange={(e) => updateRow(idx, { unit_cost: Number(e.target.value) })} /></TableCell>
                    <TableCell><Input disabled={!editable} value={it.batch_number ?? ""} onChange={(e) => updateRow(idx, { batch_number: e.target.value })} placeholder="optional" /></TableCell>
                    <TableCell><Input type="date" disabled={!editable} value={it.expiry_date ?? ""} onChange={(e) => updateRow(idx, { expiry_date: e.target.value })} /></TableCell>
                    <TableCell className="text-right font-semibold">Rs {(Number(it.quantity || 0) * Number(it.unit_cost || 0)).toLocaleString()}</TableCell>
                    {editable && <TableCell><Button size="sm" variant="ghost" onClick={() => removeRow(idx)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-full md:w-80 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">Rs {totals.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center gap-2"><span>Tax</span>
                <Input className="w-32 h-8" type="number" min={0} step="0.01" disabled={!editable} value={po.tax} onChange={(e) => updatePo({ tax: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between items-center gap-2"><span>Discount</span>
                <Input className="w-32 h-8" type="number" min={0} step="0.01" disabled={!editable} value={po.discount} onChange={(e) => updatePo({ discount: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between border-t pt-2 text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">Rs {totals.total.toLocaleString()}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
