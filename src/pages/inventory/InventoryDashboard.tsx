import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClinicId } from "@/hooks/useClinicId";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, Truck, ShoppingCart, Receipt, AlertTriangle, CalendarClock,
  Boxes, Plus, FileText
} from "lucide-react";

interface Stats {
  products: number;
  suppliers: number;
  openPOs: number;
  todaySales: number;
  lowStock: number;
  expiringSoon: number;
  stockValue: number;
}

export default function InventoryDashboard() {
  const { clinicId, loading: cLoading } = useClinicId();
  const [stats, setStats] = useState<Stats>({
    products: 0, suppliers: 0, openPOs: 0, todaySales: 0,
    lowStock: 0, expiringSoon: 0, stockValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cLoading || !clinicId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cLoading, clinicId]);

  const load = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const [
      pRes, sRes, poRes, todayInvRes,
      productsForLow, batchesRes,
    ] = await Promise.all([
      supabase.from("inventory_products").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId!).eq("is_active", true),
      supabase.from("inventory_suppliers").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId!).eq("is_active", true),
      supabase.from("inventory_purchase_orders").select("id", { count: "exact", head: true }).eq("clinic_id", clinicId!).in("status", ["draft", "ordered"]),
      supabase.from("inventory_invoices").select("total").eq("clinic_id", clinicId!).eq("status", "issued").eq("sale_date", today),
      supabase.from("inventory_products").select("id, reorder_level").eq("clinic_id", clinicId!).eq("is_active", true),
      supabase.from("inventory_batches").select("product_id, quantity_on_hand, unit_cost, expiry_date").eq("clinic_id", clinicId!).gt("quantity_on_hand", 0),
    ]);

    const stockByProduct: Record<string, number> = {};
    let stockValue = 0;
    let expiringSoon = 0;
    (batchesRes.data ?? []).forEach((b: any) => {
      stockByProduct[b.product_id] = (stockByProduct[b.product_id] ?? 0) + Number(b.quantity_on_hand);
      stockValue += Number(b.quantity_on_hand) * Number(b.unit_cost);
      if (b.expiry_date && b.expiry_date <= in30) expiringSoon += 1;
    });

    let lowStock = 0;
    (productsForLow.data ?? []).forEach((p: any) => {
      const onHand = stockByProduct[p.id] ?? 0;
      if (Number(p.reorder_level) > 0 && onHand <= Number(p.reorder_level)) lowStock += 1;
    });

    const todaySales = (todayInvRes.data ?? []).reduce((s: number, r: any) => s + Number(r.total), 0);

    setStats({
      products: pRes.count ?? 0,
      suppliers: sRes.count ?? 0,
      openPOs: poRes.count ?? 0,
      todaySales,
      lowStock,
      expiringSoon,
      stockValue,
    });
    setLoading(false);
  };

  const cards = [
    { label: "Products", value: stats.products, icon: Package, color: "from-indigo-500 to-blue-500", to: "/clinic/inventory/products" },
    { label: "Suppliers", value: stats.suppliers, icon: Truck, color: "from-emerald-500 to-teal-500", to: "/clinic/inventory/suppliers" },
    { label: "Open POs", value: stats.openPOs, icon: ShoppingCart, color: "from-amber-500 to-orange-500", to: "/clinic/inventory/purchase-orders" },
    { label: "Today's Sales", value: `Rs ${stats.todaySales.toLocaleString()}`, icon: Receipt, color: "from-pink-500 to-rose-500", to: "/clinic/inventory/invoices" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, color: "from-rose-500 to-red-500", to: "/clinic/inventory/stock?filter=low" },
    { label: "Expiring ≤30d", value: stats.expiringSoon, icon: CalendarClock, color: "from-yellow-500 to-amber-500", to: "/clinic/inventory/stock?filter=expiring" },
    { label: "Stock Value", value: `Rs ${Math.round(stats.stockValue).toLocaleString()}`, icon: Boxes, color: "from-violet-500 to-purple-500", to: "/clinic/inventory/stock" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Inventory
          </h1>
          <p className="text-sm text-muted-foreground">Manage stock, purchases and sales</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/clinic/inventory/products"><Plus className="h-4 w-4 mr-1" />New Product</Link></Button>
          <Button asChild variant="outline"><Link to="/clinic/inventory/purchase-orders"><FileText className="h-4 w-4 mr-1" />New PO</Link></Button>
          <Button asChild><Link to="/clinic/inventory/invoices"><Receipt className="h-4 w-4 mr-1" />New Sale</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="hover:shadow-lg transition-shadow border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`bg-gradient-to-br ${c.color} p-3 rounded-xl text-white shadow-md`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-bold text-lg truncate">{loading ? "…" : c.value}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/suppliers"><Truck className="h-4 w-4 mr-2" />Suppliers</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/products"><Package className="h-4 w-4 mr-2" />Products</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/purchase-orders"><ShoppingCart className="h-4 w-4 mr-2" />Purchase Orders</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/invoices"><Receipt className="h-4 w-4 mr-2" />Sales Invoices</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/stock"><Boxes className="h-4 w-4 mr-2" />Stock & Batches</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/adjustments"><AlertTriangle className="h-4 w-4 mr-2" />Adjustments</Link></Button>
          <Button asChild variant="ghost" className="justify-start"><Link to="/clinic/inventory/ledger"><FileText className="h-4 w-4 mr-2" />Stock Ledger</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
