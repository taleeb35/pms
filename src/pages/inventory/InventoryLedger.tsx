import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, FileText } from "lucide-react";

interface Row { id: string; created_at: string; product_id: string; change_qty: number; reason: string; reference_type: string | null; notes: string | null; }
interface Product { id: string; name: string; }

export default function InventoryLedger() {
  const { clinicId, loading: cLoading } = useClinicId();
  const [rows, setRows] = useState<Row[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => { if (!cLoading && clinicId) void load(); /* eslint-disable-next-line */ }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const [rRes, pRes] = await Promise.all([
      supabase.from("inventory_stock_ledger").select("*").eq("clinic_id", clinicId!).order("created_at", { ascending: false }).limit(1000),
      supabase.from("inventory_products").select("id, name").eq("clinic_id", clinicId!).order("name"),
    ]);
    setRows((rRes.data ?? []) as Row[]);
    setProducts((pRes.data ?? []) as Product[]);
    setLoading(false);
  };

  const filtered = rows.filter((r) => {
    if (productFilter !== "all" && r.product_id !== productFilter) return false;
    if (reasonFilter !== "all" && r.reason !== reasonFilter) return false;
    if (search.trim()) {
      const p = products.find((pp) => pp.id === r.product_id)?.name ?? "";
      if (!p.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-slate-600" />Stock Ledger</h1>
        <p className="text-sm text-muted-foreground">Every stock movement (last 1000 entries)</p>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product…" className="pl-9" />
          </div>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Product" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Reason" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reasons</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : (
          <div className="border rounded-lg overflow-x-auto">
            <Table><TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Product</TableHead><TableHead>Reason</TableHead>
              <TableHead>Reference</TableHead><TableHead className="text-right">Change</TableHead><TableHead>Notes</TableHead>
            </TableRow></TableHeader><TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No entries.</TableCell></TableRow> :
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell>{products.find((p) => p.id === r.product_id)?.name ?? "—"}</TableCell>
                    <TableCell className="capitalize">{r.reason}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reference_type ?? "—"}</TableCell>
                    <TableCell className={`text-right font-semibold ${Number(r.change_qty) < 0 ? "text-rose-600" : "text-emerald-600"}`}>{Number(r.change_qty) > 0 ? "+" : ""}{r.change_qty}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.notes ?? "—"}</TableCell>
                  </TableRow>
                ))}
            </TableBody></Table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
