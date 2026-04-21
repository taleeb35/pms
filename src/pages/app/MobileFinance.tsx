import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileSection from "@/components/mobile/MobileSection";
import MobileListItem from "@/components/mobile/MobileListItem";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Wallet, Receipt, Banknote, ExternalLink } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ApptRow {
  id: string;
  appointment_date: string;
  patient_id: string;
  consultation_fee: number | null;
  other_fee: number | null;
  procedure_fee: number | null;
  refund: number | null;
  total_fee: number | null;
}

const fmtPKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString("en-PK")}`;

const MobileFinance = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [refunds, setRefunds] = useState(0);
  const [recent, setRecent] = useState<Array<{ id: string; date: string; patient: string; amount: number }>>([]);

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    try {
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

      // Resolve doctor IDs to query
      let doctorIds: string[] = [];
      let clinicId: string | null = null;
      if (role === "doctor") {
        doctorIds = [userId];
      } else {
        clinicId = userId;
        const { data: docs } = await supabase
          .from("doctors")
          .select("id")
          .eq("clinic_id", userId);
        doctorIds = (docs ?? []).map((d) => d.id);
      }

      // Revenue from appointments this month
      let totalRev = 0;
      let totalRef = 0;
      let recentList: typeof recent = [];
      if (doctorIds.length) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, appointment_date, patient_id, consultation_fee, other_fee, procedure_fee, refund, total_fee")
          .in("doctor_id", doctorIds)
          .eq("status", "completed")
          .gte("appointment_date", monthStart)
          .lte("appointment_date", monthEnd)
          .order("appointment_date", { ascending: false })
          .limit(200);
        const list = (appts ?? []) as ApptRow[];
        list.forEach((a) => {
          const sub = (a.consultation_fee ?? 0) + (a.other_fee ?? 0) + (a.procedure_fee ?? 0);
          const total = a.total_fee ?? Math.max(0, sub - (a.refund ?? 0));
          totalRev += total;
          totalRef += a.refund ?? 0;
        });

        // Recent 5 with patient names
        const top5 = list.slice(0, 5);
        if (top5.length) {
          const pids = Array.from(new Set(top5.map((a) => a.patient_id)));
          const { data: pats } = await supabase
            .from("patients")
            .select("id, full_name")
            .in("id", pids);
          const nameMap = new Map((pats ?? []).map((p) => [p.id, p.full_name]));
          recentList = top5.map((a) => ({
            id: a.id,
            date: a.appointment_date,
            patient: nameMap.get(a.patient_id) ?? "Patient",
            amount:
              a.total_fee ??
              Math.max(
                0,
                (a.consultation_fee ?? 0) +
                  (a.other_fee ?? 0) +
                  (a.procedure_fee ?? 0) -
                  (a.refund ?? 0)
              ),
          }));
        }
      }

      // Expenses (clinic only)
      let totalExp = 0;
      if (clinicId) {
        const { data: exp } = await supabase
          .from("clinic_expenses")
          .select("amount")
          .eq("clinic_id", clinicId)
          .gte("expense_date", monthStart)
          .lte("expense_date", monthEnd);
        totalExp = (exp ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0);
      }

      setRevenue(totalRev);
      setRefunds(totalRef);
      setExpenses(totalExp);
      setRecent(recentList);
    } finally {
      setLoading(false);
    }
  };

  const net = revenue - expenses;
  const monthLabel = format(new Date(), "MMMM yyyy");
  const webPath = role === "clinic" ? "/clinic/finance" : "/doctor/finance";

  return (
    <MobileScreen title="Finance" subtitle={monthLabel} back="/app">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Hero net card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 mb-5 shadow-lg shadow-primary/20">
            <p className="text-xs opacity-80 uppercase tracking-wider font-medium">Net This Month</p>
            <p className="text-3xl font-bold mt-1">{fmtPKR(net)}</p>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Rev {fmtPKR(revenue)}</span>
              </div>
              {role === "clinic" && (
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Exp {fmtPKR(expenses)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl bg-card border border-border/60 p-4">
              <Wallet className="h-5 w-5 text-emerald-600 mb-2" />
              <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Revenue</p>
              <p className="text-lg font-bold mt-1">{fmtPKR(revenue)}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border/60 p-4">
              <Receipt className="h-5 w-5 text-rose-600 mb-2" />
              <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                {role === "clinic" ? "Expenses" : "Refunds"}
              </p>
              <p className="text-lg font-bold mt-1">
                {fmtPKR(role === "clinic" ? expenses : refunds)}
              </p>
            </div>
          </div>

          <MobileSection title="Quick Actions">
            {role === "clinic" && (
              <MobileListItem
                leading={<Receipt className="h-5 w-5 text-primary" />}
                title="Manage Expenses"
                subtitle="Add, edit & track clinic costs"
                onClick={() => (window.location.href = "/app/expenses")}
              />
            )}
            <MobileListItem
              leading={<Banknote className="h-5 w-5 text-primary" />}
              title="Subscription & Billing"
              subtitle="Plan, payments, invoices"
              onClick={() => (window.location.href = "/app/subscription")}
            />
            <MobileListItem
              leading={<ExternalLink className="h-5 w-5 text-primary" />}
              title="Detailed Reports"
              subtitle="Charts, breakdowns & export"
              onClick={() => (window.location.href = webPath)}
            />
          </MobileSection>

          <MobileSection title="Recent Earnings">
            {recent.length === 0 ? (
              <MobileEmptyState
                title="No completed visits yet"
                description="Earnings will appear once you complete appointments this month."
              />
            ) : (
              recent.map((r) => (
                <MobileListItem
                  key={r.id}
                  title={r.patient}
                  subtitle={format(new Date(r.date), "MMM d, yyyy")}
                  trailing={
                    <span className="text-sm font-bold text-emerald-600">{fmtPKR(r.amount)}</span>
                  }
                />
              ))
            )}
          </MobileSection>

          <p className="text-center text-xs text-muted-foreground mt-4">
            <Link to={webPath} className="underline">
              Open full finance dashboard →
            </Link>
          </p>
        </>
      )}
    </MobileScreen>
  );
};

export default MobileFinance;
