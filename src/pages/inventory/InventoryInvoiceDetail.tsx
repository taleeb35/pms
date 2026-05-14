import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, Trash2, Save, CheckCircle2, XCircle, Printer, Undo2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Inv {
  id: string; clinic_id: string; invoice_number: string; status: string;
  customer_name: string | null; customer_phone: string | null;
  sale_date: string; subtotal: number; tax: number; discount: number; total: number; notes: string | null;
}
interface Item { id?: string; product_id: string; quantity: number; unit_price: number; line_total: number; _stock?: number; _returned?: number; _productName?: string; }
interface Product { id: string; name: string; unit: string; sale_price: number; }

export default function InventoryInvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { toast } = useToast();
  const [inv, setInv] = useState<Inv | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [returns, setReturns] = useState<any[]>([]);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnQty, setReturnQty] = useState<Record<string, number>>({});
  const [returnNotes, setReturnNotes] = useState("");
  const [membership, setMembership] = useState<{
    plan_name: string; pharmacy_discount_pct: number; card_number: string; color: string;
  } | null>(null);
  const [memberDiscountApplied, setMemberDiscountApplied] = useState(false);

  // Lookup patient by phone within clinic to find active membership
  useEffect(() => {
    const phone = inv?.customer_phone?.trim();
    if (!phone || !inv?.clinic_id) { setMembership(null); return; }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { setMembership(null); return; }
    const t = setTimeout(async () => {
      const { data: pats } = await supabase
        .from("patients")
        .select("id, phone")
        .ilike("phone", `%${digits.slice(-9)}%`)
        .limit(20);
      if (!pats || pats.length === 0) { setMembership(null); return; }
      // Try each candidate against active membership for this clinic
      for (const p of pats) {
        const { data } = await supabase.rpc("get_active_patient_membership", { _patient_id: p.id });
        const arr = (data as any[]) ?? [];
        const m = arr.find((x) => x.clinic_id === inv.clinic_id);
        if (m && Number(m.pharmacy_discount_pct) > 0) {
          setMembership({
            plan_name: m.plan_name,
            pharmacy_discount_pct: Number(m.pharmacy_discount_pct),
            card_number: m.card_number,
            color: m.color,
          });
          return;
        }
      }
      setMembership(null);
    }, 350);
    return () => clearTimeout(t);
  }, [inv?.customer_phone, inv?.clinic_id]);

  const applyMembershipDiscount = () => {
    if (!membership || !inv) return;
    const subtotal = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);
    const disc = Math.round(subtotal * membership.pharmacy_discount_pct) / 100;
    setInv({ ...inv, discount: disc, notes: `${inv.notes ?? ""}${inv.notes ? " | " : ""}Member discount: ${membership.pharmacy_discount_pct}% (${membership.card_number})`.trim() });
    setMemberDiscountApplied(true);
  };


  useEffect(() => { if (id) void load(); /* eslint-disable-next-line */ }, [id]);

  const load = async () => {
    setLoading(true);
    const invRes = await supabase.from("inventory_invoices").select("*").eq("id", id!).single();
    if (invRes.error) { toast({ title: "Error", description: invRes.error.message, variant: "destructive" }); nav("/clinic/inventory/invoices"); return; }
    const invData = invRes.data as Inv;
    setInv(invData);

    const [itemsRes, prodRes, batchRes, retRes, retItemsRes] = await Promise.all([
      supabase.from("inventory_invoice_items").select("*").eq("invoice_id", id!).order("created_at"),
      supabase.from("inventory_products").select("id, name, unit, sale_price").eq("clinic_id", invData.clinic_id).eq("is_active", true).order("name"),
      supabase.from("inventory_batches").select("product_id, quantity_on_hand").eq("clinic_id", invData.clinic_id),
      supabase.from("inventory_invoice_returns").select("*").eq("invoice_id", id!).order("created_at", { ascending: false }),
      supabase.from("inventory_invoice_return_items").select("invoice_item_id, quantity").in("return_id",
        ((await supabase.from("inventory_invoice_returns").select("id").eq("invoice_id", id!)).data ?? []).map((r: any) => r.id)
      ),
    ]);

    const sm: Record<string, number> = {};
    (batchRes.data ?? []).forEach((b: any) => { sm[b.product_id] = (sm[b.product_id] ?? 0) + Number(b.quantity_on_hand); });
    setStockMap(sm);

    const returnedMap: Record<string, number> = {};
    (retItemsRes.data ?? []).forEach((r: any) => {
      if (r.invoice_item_id) returnedMap[r.invoice_item_id] = (returnedMap[r.invoice_item_id] ?? 0) + Number(r.quantity);
    });
    const prodMap = new Map((prodRes.data ?? []).map((p: any) => [p.id, p.name]));
    const enriched = (itemsRes.data ?? []).map((it: any) => ({
      ...it, _returned: returnedMap[it.id] ?? 0, _productName: prodMap.get(it.product_id) ?? "—",
    }));
    setItems(enriched as Item[]);
    setProducts((prodRes.data ?? []) as Product[]);
    setReturns(retRes.data ?? []);
    setLoading(false);
  };

  const editable = inv?.status === "draft";
  const canIssue = inv?.status === "draft";
  const canCancel = inv?.status === "draft";
  const canReturn = inv?.status === "issued";

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);
    const tax = Number(inv?.tax ?? 0);
    const discount = Number(inv?.discount ?? 0);
    return { subtotal, total: subtotal + tax - discount };
  }, [items, inv?.tax, inv?.discount]);

  const updateInv = (patch: Partial<Inv>) => setInv((p) => p ? { ...p, ...patch } : p);

  const addRow = () => setItems([...items, { product_id: "", quantity: 1, unit_price: 0, line_total: 0 }]);
  const updateRow = (idx: number, patch: Partial<Item>) => {
    const next = items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      if (patch.product_id) {
        const p = products.find((pp) => pp.id === patch.product_id);
        if (p && (!merged.unit_price || merged.unit_price === 0)) merged.unit_price = Number(p.sale_price);
      }
      merged.line_total = Number(merged.quantity || 0) * Number(merged.unit_price || 0);
      return merged;
    });
    setItems(next);
  };
  const removeRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const save = async () => {
    if (!inv) return;
    if (items.some((it) => !it.product_id || Number(it.quantity) <= 0)) {
      toast({ title: "Each line needs a product and quantity > 0", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error: upErr } = await supabase.from("inventory_invoices").update({
      customer_name: inv.customer_name, customer_phone: inv.customer_phone,
      sale_date: inv.sale_date, tax: Number(inv.tax || 0), discount: Number(inv.discount || 0),
      subtotal: totals.subtotal, total: totals.total, notes: inv.notes,
    }).eq("id", inv.id);
    if (upErr) { setSaving(false); toast({ title: "Error", description: upErr.message, variant: "destructive" }); return; }

    await supabase.from("inventory_invoice_items").delete().eq("invoice_id", inv.id);
    if (items.length) {
      const payload = items.map((it) => ({
        invoice_id: inv.id, product_id: it.product_id,
        quantity: Number(it.quantity), unit_price: Number(it.unit_price),
        line_total: Number(it.quantity) * Number(it.unit_price),
      }));
      const { error: itErr } = await supabase.from("inventory_invoice_items").insert(payload);
      if (itErr) { setSaving(false); toast({ title: "Error", description: itErr.message, variant: "destructive" }); return; }
    }
    setSaving(false);
    toast({ title: "Saved" });
    void load();
  };

  const issue = async () => {
    if (items.length === 0) { toast({ title: "Add items first", variant: "destructive" }); return; }
    // Pre-check stock
    const need: Record<string, number> = {};
    items.forEach((i) => { need[i.product_id] = (need[i.product_id] ?? 0) + Number(i.quantity); });
    for (const pid of Object.keys(need)) {
      if ((stockMap[pid] ?? 0) < need[pid]) {
        const p = products.find((pp) => pp.id === pid);
        toast({ title: "Insufficient stock", description: `${p?.name ?? pid}: have ${stockMap[pid] ?? 0}, need ${need[pid]}`, variant: "destructive" });
        return;
      }
    }
    if (!confirm("Issue this invoice? Stock will be deducted (FEFO) and this cannot be edited.")) return;
    await save();
    setBusy(true);
    const { error } = await supabase.rpc("issue_sales_invoice", { _invoice_id: inv!.id });
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Invoice issued — stock updated" });
    void load();
  };

  const cancel = async () => {
    if (!confirm("Cancel this invoice?")) return;
    setBusy(true);
    const { error } = await supabase.from("inventory_invoices").update({ status: "cancelled" }).eq("id", inv!.id);
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Invoice cancelled" });
    void load();
  };

  const print = () => window.print();

  const openReturn = () => {
    const init: Record<string, number> = {};
    items.forEach((it) => { if (it.id) init[it.id] = 0; });
    setReturnQty(init); setReturnNotes(""); setReturnOpen(true);
  };

  const returnTotal = useMemo(() => {
    return items.reduce((s, it) => {
      const q = it.id ? Number(returnQty[it.id] || 0) : 0;
      return s + q * Number(it.unit_price || 0);
    }, 0);
  }, [items, returnQty]);

  const submitReturn = async () => {
    const payload = items
      .filter((it) => it.id && Number(returnQty[it.id!] || 0) > 0)
      .map((it) => ({ invoice_item_id: it.id, quantity: Number(returnQty[it.id!]) }));
    if (payload.length === 0) { toast({ title: "Enter at least one quantity to return", variant: "destructive" }); return; }
    for (const it of items) {
      if (!it.id) continue;
      const q = Number(returnQty[it.id] || 0);
      const max = Number(it.quantity) - Number(it._returned || 0);
      if (q > max) { toast({ title: "Quantity exceeds returnable", description: `${it._productName}: max ${max}`, variant: "destructive" }); return; }
    }
    setBusy(true);
    const { error } = await supabase.rpc("return_sales_invoice", {
      _invoice_id: inv!.id, _items: payload as any, _notes: returnNotes || null, _return_date: null,
    });
    setBusy(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Return processed — stock restocked" });
    setReturnOpen(false);
    void load();
  };

  if (loading || !inv) return <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm"><Link to="/clinic/inventory/invoices"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <div>
            <h1 className="text-xl font-bold font-mono">{inv.invoice_number}</h1>
            <div className="text-xs">Status: <span className="font-semibold uppercase">{inv.status}</span></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {editable && <Button variant="outline" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save Draft</>}</Button>}
          {canIssue && <Button onClick={issue} disabled={busy || saving} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4 mr-1" />Issue & Deduct Stock</Button>}
          {canCancel && <Button variant="outline" onClick={cancel} disabled={busy} className="text-rose-600"><XCircle className="h-4 w-4 mr-1" />Cancel</Button>}
          {inv.status === "issued" && <Button variant="outline" onClick={print}><Printer className="h-4 w-4 mr-1" />Print</Button>}
          {canReturn && <Button variant="outline" onClick={openReturn} className="text-amber-700 border-amber-300"><Undo2 className="h-4 w-4 mr-1" />Refund / Return</Button>}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><Label>Customer Name</Label><Input disabled={!editable} value={inv.customer_name ?? ""} onChange={(e) => updateInv({ customer_name: e.target.value })} placeholder="Walk-in" /></div>
          <div><Label>Phone</Label><Input disabled={!editable} value={inv.customer_phone ?? ""} onChange={(e) => updateInv({ customer_phone: e.target.value })} /></div>
          <div><Label>Sale Date</Label><Input type="date" disabled={!editable} value={inv.sale_date} onChange={(e) => updateInv({ sale_date: e.target.value })} /></div>
          <div className="md:col-span-3"><Label>Notes</Label><Textarea rows={2} disabled={!editable} value={inv.notes ?? ""} onChange={(e) => updateInv({ notes: e.target.value })} /></div>
        </CardContent>
      </Card>

      {membership && editable && (
        <Card className="border-l-4" style={{ borderLeftColor: membership.color }}>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ background: membership.color }}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div><span className="font-semibold">{membership.plan_name} Member</span> · <span className="font-mono text-xs">{membership.card_number}</span></div>
                <div className="text-xs text-muted-foreground">Eligible for {membership.pharmacy_discount_pct}% pharmacy discount</div>
              </div>
            </div>
            {memberDiscountApplied ? (
              <Badge className="bg-emerald-500"><CheckCircle2 className="h-3 w-3 mr-1" />Discount Applied</Badge>
            ) : (
              <Button size="sm" onClick={applyMembershipDiscount}>Apply {membership.pharmacy_discount_pct}% Discount</Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Items</CardTitle>
          {editable && <Button size="sm" onClick={addRow}><Plus className="h-4 w-4 mr-1" />Add Line</Button>}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="min-w-[220px]">Product</TableHead>
                <TableHead className="w-24">In Stock</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Price (Rs)</TableHead>
                <TableHead className="text-right w-32">Line Total</TableHead>
                {editable && <TableHead className="w-12"></TableHead>}
              </TableRow></TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={editable ? 6 : 5} className="text-center text-muted-foreground py-6">No items.</TableCell></TableRow>
                )}
                {items.map((it, idx) => {
                  const stock = stockMap[it.product_id] ?? 0;
                  const over = it.product_id && Number(it.quantity) > stock;
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select disabled={!editable} value={it.product_id} onValueChange={(v) => updateRow(idx, { product_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>
                            {products.map((p) => {
                              const s = stockMap[p.id] ?? 0;
                              return <SelectItem key={p.id} value={p.id} disabled={s <= 0}>{p.name} ({p.unit}) — stock: {s}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className={over ? "text-rose-600 font-semibold" : ""}>{it.product_id ? stock : "—"}</TableCell>
                      <TableCell><Input type="number" min={0} step="1" disabled={!editable} value={it.quantity} onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })} className={over ? "border-rose-500" : ""} /></TableCell>
                      <TableCell><Input type="number" min={0} step="0.01" disabled={!editable} value={it.unit_price} onChange={(e) => updateRow(idx, { unit_price: Number(e.target.value) })} /></TableCell>
                      <TableCell className="text-right font-semibold">Rs {(Number(it.quantity || 0) * Number(it.unit_price || 0)).toLocaleString()}</TableCell>
                      {editable && <TableCell><Button size="sm" variant="ghost" onClick={() => removeRow(idx)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button></TableCell>}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-full md:w-80 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">Rs {totals.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center gap-2"><span>Tax</span>
                <Input className="w-32 h-8" type="number" min={0} step="0.01" disabled={!editable} value={inv.tax} onChange={(e) => updateInv({ tax: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between items-center gap-2"><span>Discount</span>
                <Input className="w-32 h-8" type="number" min={0} step="0.01" disabled={!editable} value={inv.discount} onChange={(e) => updateInv({ discount: Number(e.target.value) })} />
              </div>
              <div className="flex justify-between border-t pt-2 text-base"><span className="font-semibold">Total</span><span className="font-bold text-primary">Rs {totals.total.toLocaleString()}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {returns.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Refunds / Returns</CardTitle></CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Return #</TableHead><TableHead>Date</TableHead>
                  <TableHead className="text-right">Refund (Rs)</TableHead><TableHead>Notes</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {returns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono">{r.return_number}</TableCell>
                      <TableCell>{r.return_date}</TableCell>
                      <TableCell className="text-right font-semibold text-amber-700">Rs {Number(r.total_refund).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{r.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-right mt-3 text-sm">
              Total refunded: <span className="font-bold text-amber-700">Rs {returns.reduce((s, r) => s + Number(r.total_refund), 0).toLocaleString()}</span>
              {" · "}Net: <span className="font-bold">Rs {(Number(inv.total) - returns.reduce((s, r) => s + Number(r.total_refund), 0)).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Process Refund / Return</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-20 text-right">Sold</TableHead>
                  <TableHead className="w-24 text-right">Returned</TableHead>
                  <TableHead className="w-24 text-right">Returnable</TableHead>
                  <TableHead className="w-28">Return Qty</TableHead>
                  <TableHead className="w-28 text-right">Refund</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {items.map((it) => {
                    const max = Number(it.quantity) - Number(it._returned ?? 0);
                    const q = it.id ? Number(returnQty[it.id] || 0) : 0;
                    return (
                      <TableRow key={it.id}>
                        <TableCell>{it._productName}</TableCell>
                        <TableCell className="text-right">{Number(it.quantity)}</TableCell>
                        <TableCell className="text-right">{Number(it._returned ?? 0)}</TableCell>
                        <TableCell className="text-right font-semibold">{max}</TableCell>
                        <TableCell>
                          <Input type="number" min={0} max={max} step="1" value={q}
                            onChange={(e) => setReturnQty({ ...returnQty, [it.id!]: Math.max(0, Math.min(max, Number(e.target.value))) })}
                            disabled={max <= 0} />
                        </TableCell>
                        <TableCell className="text-right">Rs {(q * Number(it.unit_price)).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div><Label>Reason / Notes</Label><Textarea rows={2} value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} placeholder="e.g. customer returned damaged item" /></div>
            <div className="flex justify-between items-center bg-muted/50 rounded-lg px-3 py-2">
              <span className="font-semibold">Total Refund</span>
              <span className="text-lg font-bold text-amber-700">Rs {returnTotal.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={submitReturn} disabled={busy || returnTotal <= 0} className="bg-amber-600 hover:bg-amber-700">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Undo2 className="h-4 w-4 mr-1" />Process Return</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
