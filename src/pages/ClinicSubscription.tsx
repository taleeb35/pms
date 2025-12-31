import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Users, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, addMonths, addYears, differenceInDays, isPast, parseISO } from "date-fns";

interface ClinicData {
  payment_plan: string;
  requested_doctors: number;
  no_of_doctors: number;
  trial_end_date: string | null;
  fee_status: string;
  created_at: string;
}

const ClinicSubscription = () => {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clinics")
        .select("payment_plan, requested_doctors, no_of_doctors, trial_end_date, fee_status, created_at")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setClinic(data);
      }
      setLoading(false);
    };

    fetchClinicData();
  }, []);

  const getTrialStatus = () => {
    if (!clinic?.trial_end_date) return { isOnTrial: false, daysLeft: 0 };
    
    const trialEnd = parseISO(clinic.trial_end_date);
    const today = new Date();
    const daysLeft = differenceInDays(trialEnd, today);
    
    return {
      isOnTrial: daysLeft >= 0,
      daysLeft: Math.max(0, daysLeft),
      isExpired: isPast(trialEnd)
    };
  };

  const getNextRenewalDate = () => {
    if (!clinic) return null;
    
    const trialStatus = getTrialStatus();
    
    // If on trial, next renewal is after trial ends
    if (trialStatus.isOnTrial && clinic.trial_end_date) {
      return parseISO(clinic.trial_end_date);
    }
    
    // Otherwise calculate based on payment plan and created_at
    const baseDate = clinic.trial_end_date ? parseISO(clinic.trial_end_date) : parseISO(clinic.created_at);
    
    if (clinic.payment_plan === "yearly") {
      return addYears(baseDate, 1);
    }
    return addMonths(baseDate, 1);
  };

  const trialStatus = clinic ? getTrialStatus() : null;
  const nextRenewal = getNextRenewalDate();
  const monthlyRate = 5999;
  const yearlyRate = Math.round(5999 * 12 * 0.83); // 17% discount

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!clinic) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load subscription data.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Manage your clinic subscription and billing</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize">{clinic.payment_plan}</span>
                <Badge variant={clinic.payment_plan === "yearly" ? "default" : "secondary"}>
                  {clinic.payment_plan === "yearly" ? "17% Savings" : "Standard"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PKR {clinic.payment_plan === "yearly" ? yearlyRate.toLocaleString() : monthlyRate.toLocaleString()} per doctor / {clinic.payment_plan === "yearly" ? "year" : "month"}
              </p>
            </CardContent>
          </Card>

          {/* Doctor Limit */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doctor Limit</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clinic.no_of_doctors} / {clinic.requested_doctors}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active doctors out of your plan limit
              </p>
              <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((clinic.no_of_doctors / clinic.requested_doctors) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{clinic.payment_plan}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {clinic.payment_plan === "yearly" 
                  ? "Billed annually with 17% discount" 
                  : "Billed every month"}
              </p>
            </CardContent>
          </Card>

          {/* Trial Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {trialStatus?.isOnTrial ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-success">{trialStatus.daysLeft}</span>
                    <Badge variant="outline" className="border-success text-success">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Days remaining in your free trial
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">Expired</span>
                    <Badge variant="secondary">Trial Ended</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your trial period has ended
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              {clinic.fee_status === "paid" ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold capitalize">{clinic.fee_status}</span>
                <Badge variant={clinic.fee_status === "paid" ? "default" : "destructive"}>
                  {clinic.fee_status === "paid" ? "Active" : "Action Required"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {clinic.fee_status === "paid" 
                  ? "Your subscription is up to date" 
                  : "Please complete your payment"}
              </p>
            </CardContent>
          </Card>

          {/* Next Renewal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {nextRenewal ? format(nextRenewal, "MMM dd, yyyy") : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {trialStatus?.isOnTrial 
                  ? "Billing starts after trial ends" 
                  : `Your ${clinic.payment_plan} subscription renews`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>Your current billing based on {clinic.requested_doctors} doctor(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Base rate per doctor</span>
                <span className="font-medium">PKR 5,999 / month</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Doctor limit</span>
                <span className="font-medium">{clinic.requested_doctors} doctor(s)</span>
              </div>
              {clinic.payment_plan === "yearly" && (
                <div className="flex justify-between items-center py-2 border-b text-success">
                  <span>Yearly discount (17%)</span>
                  <span className="font-medium">
                    - PKR {Math.round(5999 * 12 * clinic.requested_doctors * 0.17).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 text-lg font-bold">
                <span>Total {clinic.payment_plan === "yearly" ? "Yearly" : "Monthly"}</span>
                <span>
                  PKR {clinic.payment_plan === "yearly" 
                    ? (yearlyRate * clinic.requested_doctors).toLocaleString()
                    : (monthlyRate * clinic.requested_doctors).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClinicSubscription;
