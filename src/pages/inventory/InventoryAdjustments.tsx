import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, AlertTriangle } from "lucide-react";

interface Product { id: string; name: string; unit: string; }
interface Batch { id: string; product_id: string; batch_number: string | null; expiry_date: string | null; quantity_on_hand: number; }
interface Adj { id: string; created_at: string; product_id: string; batch_id: string | null; quantity_delta: number; reason: string; notes: string | null; }

const REASONS = ["Stock count correction", "Damaged", "Expired", "Lost", "Returned to supplier", "Other"];

export default function InventoryAdjustments() {
  const { clinicId, loading: cLoading } = useClinicId();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [list, setList] = useState<Adj[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", batch_id: "none", delta: 0, reason: REASONS[0], notes: "" });

  useEffect(() => { if (!cLoading && clinicId) void load(); /* eslint-disable-next-line */ }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const [pRes, bRes, aRes] = await Promise.all([
      supabase.from("inventory_products").select("id, name, unit").eq("clinic_id", clinicId!).eq("is_active", true).order("name"),
      supabase.from("inventory_batches").select("id, product_id, batch_number, expiry_date, quantity_on_hand").eq("clinic_id", clinicId!).gt("quantity_on_hand", 0),
      supabase.from("inventory_adjustments").select("*").eq("clinic_id", clinicId!).order("created_at", { ascending: false }).limit(200),
    ]);
    setProducts((pRes.data ?? []) as Product[]);
    setBatches((bRes.data ?? []) as Batch[]);
    setList((aRes.data ?? []) as Adj[]);
    setLoading(false);
  };

  const save = async () => {
    if (!form.product_id) { toast({ title: "Choose a product", variant: "destructive" }); return; }
    if (!form.delta || Number(form.delta) === 0) { toast({ title: "Delta cannot be 0", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.rpc("apply_inventory_adjustment", {
      _clinic_id: clinicId!, _product_id: form.product_id,
      _batch_id: form.batch_id === "none" ? null : form.batch_id,
      _delta: Number(form.delta), _reason: form.reason, _notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Adjustment applied" });
    setOpen(false);
    setForm({ product_id: "", batch_id: "none", delta: 0, reason: REASONS[0], notes: "" });
    void load();
  };

  const productBatches = batches.filter((b) => b.product_id === form.product_id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6 text-rose-600" />Stock Adjustments</h1>
          <p className="text-sm text-muted-foreground">Correct stock for damages, losses, recounts</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />New Adjustment</Button>
      </div>

      <Card><CardContent className="p-4">
        {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : list.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No adjustments yet.</div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Batch</TableHead>
              <TableHead className="text-right">Change</TableHead><TableHead>Reason</TableHead><TableHead>Notes</TableHead>
            </TableRow></TableHeader><TableBody>
              {list.map((a) => {
                const p = products.find((pp) => pp.id === a.product_id);
                const b = batches.find((bb) => bb.id === a.batch_id);
                return (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                    <TableCell>{p?.name ?? "—"}</TableCell>
                    <TableCell>{b?.batch_number ?? "—"}</TableCell>
                    <TableCell className={`text-right font-semibold ${Number(a.quantity_delta) < 0 ? "text-rose-600" : "text-emerald-600"}`}>{Number(a.quantity_delta) > 0 ? "+" : ""}{a.quantity_delta}</TableCell>
                    <TableCell>{a.reason}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{a.notes ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table>
          </div>
        )}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Stock Adjustment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product *</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v, batch_id: "none" })}>
                <SelectTrigger><SelectValue placeholder="Choose product" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch (required for negative adjustment)</Label>
              <Select value={form.batch_id} onValueChange={(v) => setForm({ ...form, batch_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— none (positive only) —</SelectItem>
                  {productBatches.map((b) => <SelectItem key={b.id} value={b.id}>{(b.batch_number ?? "no-batch")} • exp {b.expiry_date ?? "—"} • on hand {b.quantity_on_hand}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity Change *</Label>
              <Input type="number" step="1" value={form.delta} onChange={(e) => setForm({ ...form, delta: Number(e.target.value) })} placeholder="e.g. -5 or 10" />
              <p className="text-xs text-muted-foreground mt-1">Use negative numbers to deduct, positive to add.</p>
            </div>
            <div>
              <Label>Reason *</Label>
              <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
