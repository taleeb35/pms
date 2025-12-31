import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format, addMonths, addYears, differenceInDays, isPast, parseISO } from "date-fns";

interface DoctorData {
  payment_plan: string;
  trial_end_date: string | null;
  clinic_id: string | null;
  created_at: string;
}

interface DoctorPayment {
  status: string;
  month: string;
}

const DoctorSubscription = () => {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [latestPayment, setLatestPayment] = useState<DoctorPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [doctorRes, paymentRes] = await Promise.all([
        supabase
          .from("doctors")
          .select("payment_plan, trial_end_date, clinic_id, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("doctor_payments")
          .select("status, month")
          .eq("doctor_id", user.id)
          .order("month", { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (!doctorRes.error && doctorRes.data) {
        setDoctor(doctorRes.data);
      }
      if (!paymentRes.error && paymentRes.data) {
        setLatestPayment(paymentRes.data);
      }
      setLoading(false);
    };

    fetchDoctorData();
  }, []);

  const getTrialStatus = () => {
    if (!doctor?.trial_end_date) return { isOnTrial: false, daysLeft: 0 };
    
    const trialEnd = parseISO(doctor.trial_end_date);
    const today = new Date();
    const daysLeft = differenceInDays(trialEnd, today);
    
    return {
      isOnTrial: daysLeft >= 0,
      daysLeft: Math.max(0, daysLeft),
      isExpired: isPast(trialEnd)
    };
  };

  const getNextRenewalDate = () => {
    if (!doctor) return null;
    
    const trialStatus = getTrialStatus();
    
    // If on trial, next renewal is after trial ends
    if (trialStatus.isOnTrial && doctor.trial_end_date) {
      return parseISO(doctor.trial_end_date);
    }
    
    // Otherwise calculate based on payment plan and created_at
    const baseDate = doctor.trial_end_date ? parseISO(doctor.trial_end_date) : parseISO(doctor.created_at);
    
    if (doctor.payment_plan === "yearly") {
      return addYears(baseDate, 1);
    }
    return addMonths(baseDate, 1);
  };

  const getPaymentStatus = () => {
    if (!latestPayment) return "unpaid";
    return latestPayment.status;
  };

  const trialStatus = doctor ? getTrialStatus() : null;
  const nextRenewal = getNextRenewalDate();
  const paymentStatus = getPaymentStatus();
  const monthlyRate = 5999;
  const yearlyRate = Math.round(5999 * 12 * 0.83); // 17% discount

  // If doctor belongs to a clinic, show different message
  if (!loading && doctor?.clinic_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Your subscription information</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Managed by Clinic</h2>
              <p className="text-muted-foreground">
                Your subscription is managed by your clinic. Contact your clinic administrator for billing details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unable to load subscription data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
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
              <span className="text-2xl font-bold capitalize">{doctor.payment_plan}</span>
              <Badge variant={doctor.payment_plan === "yearly" ? "default" : "secondary"}>
                {doctor.payment_plan === "yearly" ? "17% Savings" : "Standard"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PKR {doctor.payment_plan === "yearly" ? yearlyRate.toLocaleString() : monthlyRate.toLocaleString()} / {doctor.payment_plan === "yearly" ? "year" : "month"}
            </p>
          </CardContent>
        </Card>

        {/* Billing Cycle */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Cycle</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{doctor.payment_plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {doctor.payment_plan === "yearly" 
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
            {paymentStatus === "paid" ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertCircle className="h-4 w-4 text-warning" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold capitalize">{paymentStatus}</span>
              <Badge variant={paymentStatus === "paid" ? "default" : "destructive"}>
                {paymentStatus === "paid" ? "Active" : "Action Required"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentStatus === "paid" 
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
                : `Your ${doctor.payment_plan} subscription renews`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Summary</CardTitle>
          <CardDescription>Your current billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Base rate</span>
              <span className="font-medium">PKR 5,999 / month</span>
            </div>
            {doctor.payment_plan === "yearly" && (
              <div className="flex justify-between items-center py-2 border-b text-success">
                <span>Yearly discount (17%)</span>
                <span className="font-medium">
                  - PKR {Math.round(5999 * 12 * 0.17).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 text-lg font-bold">
              <span>Total {doctor.payment_plan === "yearly" ? "Yearly" : "Monthly"}</span>
              <span>
                PKR {doctor.payment_plan === "yearly" 
                  ? yearlyRate.toLocaleString()
                  : monthlyRate.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorSubscription;
