import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Loader2, Receipt, Eye } from "lucide-react";

interface Inv {
  id: string; invoice_number: string; status: "draft" | "issued" | "cancelled";
  customer_name: string | null; customer_phone: string | null;
  sale_date: string; total: number;
}

const statusColor: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  issued: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function InventoryInvoices() {
  const { clinicId, loading: cLoading } = useClinicId();
  const { toast } = useToast();
  const nav = useNavigate();
  const [items, setItems] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (!cLoading && clinicId) void load(); /* eslint-disable-next-line */ }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("inventory_invoices")
      .select("id, invoice_number, status, customer_name, customer_phone, sale_date, total")
      .eq("clinic_id", clinicId!)
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setItems((data ?? []) as Inv[]);
    setLoading(false);
  };

  const create = async () => {
    setCreating(true);
    const { data: numData, error: numErr } = await supabase.rpc("generate_inventory_invoice_number", { _clinic_id: clinicId! });
    if (numErr || !numData) { setCreating(false); toast({ title: "Error", description: numErr?.message, variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("inventory_invoices")
      .insert({ clinic_id: clinicId, invoice_number: numData as any, created_by: user?.id })
      .select("id").single();
    setCreating(false);
    if (error || !data) { toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }
    nav(`/clinic/inventory/invoices/${data.id}`);
  };

  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.invoice_number.toLowerCase().includes(q) || (p.customer_name ?? "").toLowerCase().includes(q) || (p.customer_phone ?? "").includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-pink-600" />Sales Invoices</h1>
          <p className="text-sm text-muted-foreground">Sell medicines from stock</p>
        </div>
        <Button onClick={create} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
          New Sale
        </Button>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice, customer, phone…" className="pl-9" />
        </div>

        {loading ? (
          <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No invoices.</div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Invoice #</TableHead><TableHead>Status</TableHead><TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead><TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => nav(`/clinic/inventory/invoices/${p.id}`)}>
                    <TableCell className="font-mono font-medium">{p.invoice_number}</TableCell>
                    <TableCell><span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor[p.status]}`}>{p.status}</span></TableCell>
                    <TableCell>{p.customer_name ?? "Walk-in"}</TableCell>
                    <TableCell>{p.customer_phone ?? "—"}</TableCell>
                    <TableCell>{p.sale_date}</TableCell>
                    <TableCell className="text-right font-semibold">Rs {Number(p.total).toLocaleString()}</TableCell>
                    <TableCell><Button asChild size="sm" variant="ghost"><Link to={`/clinic/inventory/invoices/${p.id}`}><Eye className="h-4 w-4" /></Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
