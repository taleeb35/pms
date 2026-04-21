import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MobileScreen from "@/components/mobile/MobileScreen";
import MobileSection from "@/components/mobile/MobileSection";
import { useMobileRole } from "@/hooks/useMobileRole";
import { supabase } from "@/integrations/supabase/client";
import { PKR_DISCOUNTED_PRICE, PKR_YEARLY_RATE } from "@/lib/pricingConfig";
import { differenceInDays, format, parseISO, addMonths, addYears } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CalendarDays, AlertCircle, Crown, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileSubscription = () => {
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    payment_plan: string;
    trial_end_date: string | null;
    created_at: string;
    no_of_doctors?: number;
    fee_status?: string;
  } | null>(null);

  useEffect(() => {
    if (roleLoading || !userId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleLoading, userId, role]);

  const load = async () => {
    setLoading(true);
    if (role === "clinic") {
      const { data: c } = await supabase
        .from("clinics")
        .select("payment_plan, trial_end_date, created_at, no_of_doctors, fee_status")
        .eq("id", userId)
        .maybeSingle();
      setData(c as any);
    } else {
      const { data: d } = await supabase
        .from("doctors")
        .select("payment_plan, trial_end_date, created_at")
        .eq("id", userId)
        .maybeSingle();
      setData(d as any);
    }
    setLoading(false);
  };

  const trial = (() => {
    if (!data?.trial_end_date) return { active: false, days: 0 };
    const days = differenceInDays(parseISO(data.trial_end_date), new Date());
    return { active: days > 0, days };
  })();

  const docCount = role === "clinic" ? Math.max(1, data?.no_of_doctors ?? 1) : 1;
  const monthlyTotal = PKR_DISCOUNTED_PRICE * docCount;
  const yearlyTotal = PKR_YEARLY_RATE * docCount;
  const isYearly = data?.payment_plan === "yearly";

  const nextRenewal = (() => {
    if (!data) return null;
    if (trial.active && data.trial_end_date) return parseISO(data.trial_end_date);
    const base = data.trial_end_date ? parseISO(data.trial_end_date) : parseISO(data.created_at);
    return isYearly ? addYears(base, 1) : addMonths(base, 1);
  })();

  const webPath = role === "clinic" ? "/clinic/subscription" : "/doctor/subscription";

  return (
    <MobileScreen title="Subscription" back="/app/more">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : !data ? (
        <p className="text-sm text-muted-foreground text-center py-12">No subscription data found.</p>
      ) : (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground p-5 mb-5 shadow-lg shadow-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80 font-medium">Current Plan</p>
                <p className="text-2xl font-bold mt-1 capitalize flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  {data.payment_plan ?? "Monthly"}
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                {isYearly ? "17% Saved" : "Standard"}
              </Badge>
            </div>
            <div className="pt-3 border-t border-primary-foreground/20">
              <p className="text-3xl font-bold">
                Rs {(isYearly ? yearlyTotal : monthlyTotal).toLocaleString("en-PK")}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                per {isYearly ? "year" : "month"}
                {role === "clinic" && ` · ${docCount} doctor${docCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>

          {trial.active && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 mb-5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                  {trial.days} day{trial.days === 1 ? "" : "s"} left in trial
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                  Your free trial ends on {nextRenewal && format(nextRenewal, "MMM d, yyyy")}.
                </p>
              </div>
            </div>
          )}

          <MobileSection title="Billing Details">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{trial.active ? "Trial ends" : "Next renewal"}</p>
                  <p className="font-semibold text-sm">{nextRenewal ? format(nextRenewal, "MMM d, yyyy") : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t">
                <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm capitalize flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {data.fee_status ?? "Active"}
                  </p>
                </div>
              </div>
              {role === "clinic" && (
                <div className="flex items-center gap-3 pt-3 border-t">
                  <Crown className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Doctors on plan</p>
                    <p className="font-semibold text-sm">{docCount}</p>
                  </div>
                </div>
              )}
            </div>
          </MobileSection>

          <Button asChild className="w-full h-12 mb-3" variant="default">
            <Link to={webPath}>
              Manage Subscription
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Plan changes & payment methods are handled on the web dashboard.
          </p>
        </>
      )}
    </MobileScreen>
  );
};

export default MobileSubscription;
