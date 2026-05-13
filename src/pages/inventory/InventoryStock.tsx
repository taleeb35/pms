import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Boxes } from "lucide-react";

interface Product { id: string; name: string; sku: string | null; unit: string; reorder_level: number; }
interface Batch { id: string; product_id: string; batch_number: string | null; expiry_date: string | null; quantity_on_hand: number; quantity_received: number; unit_cost: number; received_at: string; }

export default function InventoryStock() {
  const { clinicId, loading: cLoading } = useClinicId();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const initialTab = params.get("filter") === "low" ? "low" : params.get("filter") === "expiring" ? "expiring" : "stock";

  useEffect(() => { if (!cLoading && clinicId) void load(); /* eslint-disable-next-line */ }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const [pRes, bRes] = await Promise.all([
      supabase.from("inventory_products").select("id, name, sku, unit, reorder_level").eq("clinic_id", clinicId!).eq("is_active", true).order("name"),
      supabase.from("inventory_batches").select("*").eq("clinic_id", clinicId!).order("expiry_date", { ascending: true, nullsFirst: false }),
    ]);
    if (pRes.error) toast({ title: "Error", description: pRes.error.message, variant: "destructive" });
    setProducts((pRes.data ?? []) as Product[]);
    setBatches((bRes.data ?? []) as Batch[]);
    setLoading(false);
  };

  const stockMap = useMemo(() => {
    const m: Record<string, { qty: number; value: number }> = {};
    batches.forEach((b) => {
      if (!m[b.product_id]) m[b.product_id] = { qty: 0, value: 0 };
      m[b.product_id].qty += Number(b.quantity_on_hand);
      m[b.product_id].value += Number(b.quantity_on_hand) * Number(b.unit_cost);
    });
    return m;
  }, [batches]);

  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const stockRows = products
    .map((p) => ({ ...p, ...(stockMap[p.id] ?? { qty: 0, value: 0 }) }))
    .filter((p) => !search.trim() || `${p.name} ${p.sku ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  const lowRows = stockRows.filter((p) => p.reorder_level > 0 && p.qty <= p.reorder_level);

  const expiringRows = batches
    .filter((b) => b.expiry_date && b.expiry_date <= in30 && Number(b.quantity_on_hand) > 0)
    .map((b) => ({ ...b, product: products.find((p) => p.id === b.product_id) }))
    .filter((b) => !search.trim() || `${b.product?.name ?? ""} ${b.batch_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  const allBatches = batches
    .filter((b) => Number(b.quantity_on_hand) > 0)
    .map((b) => ({ ...b, product: products.find((p) => p.id === b.product_id) }))
    .filter((b) => !search.trim() || `${b.product?.name ?? ""} ${b.batch_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6 text-violet-600" />Stock & Batches</h1>
        <p className="text-sm text-muted-foreground">Real-time stock from received purchase orders</p>
      </div>

      <Card><CardContent className="p-4 space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>

        {loading ? <div className="py-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div> : (
          <Tabs defaultValue={initialTab}>
            <TabsList>
              <TabsTrigger value="stock">By Product ({stockRows.length})</TabsTrigger>
              <TabsTrigger value="batches">All Batches ({allBatches.length})</TabsTrigger>
              <TabsTrigger value="low">Low Stock ({lowRows.length})</TabsTrigger>
              <TabsTrigger value="expiring">Expiring ≤30d ({expiringRows.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <div className="border rounded-lg overflow-x-auto">
                <Table><TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Reorder</TableHead>
                  <TableHead className="text-right">Stock Value</TableHead>
                </TableRow></TableHeader><TableBody>
                  {stockRows.map((p) => {
                    const low = p.reorder_level > 0 && p.qty <= p.reorder_level;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.sku ?? "—"}</TableCell>
                        <TableCell>{p.unit}</TableCell>
                        <TableCell className={`text-right font-semibold ${low ? "text-rose-600" : ""}`}>{p.qty}</TableCell>
                        <TableCell className="text-right">{p.reorder_level || "—"}</TableCell>
                        <TableCell className="text-right">Rs {Math.round(p.value).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody></Table>
              </div>
            </TabsContent>

            <TabsContent value="batches">
              <div className="border rounded-lg overflow-x-auto">
                <Table><TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Batch #</TableHead><TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Qty Received</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow></TableHeader><TableBody>
                  {allBatches.map((b) => {
                    const expSoon = b.expiry_date && b.expiry_date <= in30;
                    const expired = b.expiry_date && b.expiry_date < today;
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.product?.name ?? "—"}</TableCell>
                        <TableCell>{b.batch_number ?? "—"}</TableCell>
                        <TableCell>
                          {b.expiry_date ?? "—"}
                          {expired && <Badge variant="destructive" className="ml-2">Expired</Badge>}
                          {!expired && expSoon && <Badge className="ml-2 bg-amber-500">Expiring</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{b.quantity_received}</TableCell>
                        <TableCell className="text-right font-semibold">{b.quantity_on_hand}</TableCell>
                        <TableCell className="text-right">Rs {Number(b.unit_cost).toLocaleString()}</TableCell>
                        <TableCell>{new Date(b.received_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody></Table>
              </div>
            </TabsContent>

            <TabsContent value="low">
              <div className="border rounded-lg overflow-x-auto">
                <Table><TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Reorder Level</TableHead>
                </TableRow></TableHeader><TableBody>
                  {lowRows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No low-stock products.</TableCell></TableRow> : lowRows.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell className="text-right text-rose-600 font-semibold">{p.qty}</TableCell>
                      <TableCell className="text-right">{p.reorder_level}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </div>
            </TabsContent>

            <TabsContent value="expiring">
              <div className="border rounded-lg overflow-x-auto">
                <Table><TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Batch #</TableHead><TableHead>Expiry</TableHead><TableHead className="text-right">On Hand</TableHead>
                </TableRow></TableHeader><TableBody>
                  {expiringRows.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No expiring batches.</TableCell></TableRow> : expiringRows.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.product?.name ?? "—"}</TableCell>
                      <TableCell>{b.batch_number ?? "—"}</TableCell>
                      <TableCell>{b.expiry_date}{b.expiry_date! < today && <Badge variant="destructive" className="ml-2">Expired</Badge>}</TableCell>
                      <TableCell className="text-right font-semibold">{b.quantity_on_hand}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent></Card>
    </div>
  );
}
