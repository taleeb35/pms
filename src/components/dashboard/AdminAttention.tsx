import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserCheck, Receipt, LifeBuoy, Hourglass, Sparkles, Building2, ArrowRight, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zonedNow } from "@/lib/region";
import { PRICE_MONTHLY, usd } from "@/lib/pricingConfig";

// Admin dashboard: what needs attention today, each item clickable.
type Item = { key: string; label: string; value: string; hint: string; to: string; icon: typeof UserCheck; urgent: boolean };

const addDays = (ymd: string, d: number) => { const t = new Date(ymd + "T00:00:00"); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };

export const AdminAttention = () => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    (async () => {
      const today = zonedNow().ymd;
      const head = { count: "exact" as const, head: true };
      const [pendingDocs, draftClinics, unpaid, tickets, trials, newClinics, newDoctors, active] = await Promise.all([
        supabase.from("doctors").select("id", head).eq("approved", false),
        supabase.from("clinics").select("id", head).eq("status", "draft"),
        supabase.from("clinic_payments").select("amount").eq("status", "pending"),
        supabase.from("support_tickets").select("id", head).eq("status", "open"),
        supabase.from("clinics").select("id", head).gte("trial_end_date", today).lte("trial_end_date", addDays(today, 7)),
        supabase.from("clinics").select("id", head).gte("created_at", addDays(today, -7)),
        supabase.from("doctors").select("id", head).gte("created_at", addDays(today, -7)),
        supabase.from("clinics").select("billable_doctors, requested_doctors").eq("status", "active"),
      ]);
      const unpaidTotal = (unpaid.data || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
      const mrr = (active.data || []).reduce((s: number, c: any) => s + PRICE_MONTHLY * Math.max(Number(c.billable_doctors || c.requested_doctors || 1), 1), 0);
      setItems([
        { key: "mrr", label: "Monthly revenue (active clinics)", value: usd(mrr), hint: `${(active.data || []).length} active clinics at ${usd(PRICE_MONTHLY)}/practitioner`, to: "/admin/finance", icon: DollarSign, urgent: false },
        { key: "approve", label: "Doctors waiting for approval", value: String(pendingDocs.count || 0), hint: "Review and approve new doctors", to: "/pending-doctors", icon: UserCheck, urgent: (pendingDocs.count || 0) > 0 },
        { key: "draft", label: "Clinics not yet active", value: String(draftClinics.count || 0), hint: "Signed up but not activated", to: "/admin/clinics", icon: Building2, urgent: (draftClinics.count || 0) > 0 },
        { key: "unpaid", label: "Unpaid subscription bills", value: usd(unpaidTotal), hint: `${(unpaid.data || []).length} bills pending`, to: "/admin/finance", icon: Receipt, urgent: unpaidTotal > 0 },
        { key: "tickets", label: "Open support tickets", value: String(tickets.count || 0), hint: "Reply to doctors and clinics", to: "/support-tickets", icon: LifeBuoy, urgent: (tickets.count || 0) > 0 },
        { key: "trials", label: "Trials ending in 7 days", value: String(trials.count || 0), hint: "Good time to follow up", to: "/admin/clinics", icon: Hourglass, urgent: (trials.count || 0) > 0 },
        { key: "new", label: "New sign-ups this week", value: String((newClinics.count || 0) + (newDoctors.count || 0)), hint: `${newClinics.count || 0} clinics · ${newDoctors.count || 0} doctors`, to: "/admin/clinics", icon: Sparkles, urgent: false },
      ]);
    })();
  }, []);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3"><CardTitle className="text-lg">Needs attention</CardTitle></CardHeader>
      <CardContent>
        {!items ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <Link key={it.key} to={it.to} className={`group rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 ${it.urgent ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <it.icon className={`h-5 w-5 ${it.urgent ? "text-amber-600" : "text-primary"}`} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{it.value}</p>
                <p className="text-sm font-medium">{it.label}</p>
                <p className="text-xs text-muted-foreground">{it.hint}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAttention;
