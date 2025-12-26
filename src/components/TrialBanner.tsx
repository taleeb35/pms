import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle } from "lucide-react";

interface TrialBannerProps {
  userType: "clinic" | "doctor";
}

const TrialBanner = ({ userType }: TrialBannerProps) => {
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrialInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (userType === "clinic") {
          const { data: clinic } = await supabase
            .from("clinics")
            .select("trial_end_date")
            .eq("id", user.id)
            .maybeSingle();

          if (clinic?.trial_end_date) {
            const trialEnd = new Date(clinic.trial_end_date + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = trialEnd.getTime() - today.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setTrialDaysRemaining(diffDays);
          }
        } else if (userType === "doctor") {
          // Check if this is a single doctor (no clinic_id)
          const { data: doctor } = await supabase
            .from("doctors")
            .select("trial_end_date, clinic_id")
            .eq("id", user.id)
            .maybeSingle();

          // Only show trial banner for single doctors (no clinic)
          if (doctor && !doctor.clinic_id && doctor.trial_end_date) {
            const trialEnd = new Date(doctor.trial_end_date + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = trialEnd.getTime() - today.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setTrialDaysRemaining(diffDays);
          }
        }
      } catch (error) {
        console.error("Error fetching trial info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();
  }, [userType]);

  if (loading || trialDaysRemaining === null) {
    return null;
  }

  // Don't show if trial has expired (they would be blocked anyway)
  if (trialDaysRemaining <= 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Your free trial has expired. Please contact support to subscribe and continue using all features.
        </AlertDescription>
      </Alert>
    );
  }

  const isUrgent = trialDaysRemaining <= 3;

  return (
    <Alert 
      variant={isUrgent ? "destructive" : "default"} 
      className={`mb-4 ${isUrgent ? "" : "border-warning bg-warning/10"}`}
    >
      <Clock className={`h-4 w-4 ${isUrgent ? "" : "text-foreground"}`} />
      <AlertDescription className="ml-2 text-foreground">
        <span className="font-semibold">Free Trial:</span> You have{" "}
        <span className="font-bold">{trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""}</span>{" "}
        remaining in your 14-day trial period.
        {isUrgent && " Contact support to subscribe and avoid service interruption."}
      </AlertDescription>
    </Alert>
  );
};

export default TrialBanner;
