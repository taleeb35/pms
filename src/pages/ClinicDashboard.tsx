import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Users, Building2, Plus, AlertCircle, LifeBuoy, Activity, UserPlus, Sparkles, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, addMonths, startOfMonth } from "date-fns";
import clinicLogo from "@/assets/clinic-logo.png";
import ClinicAnalyticsCharts from "@/components/ClinicAnalyticsCharts";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import TrialBanner from "@/components/TrialBanner";

interface Clinic {
  clinic_name: string;
  no_of_doctors: number;
}

interface Doctor {
  id: string;
  specialization: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface ClinicStats {
  totalDoctors: number;
  totalPatients: number;
}

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<ClinicStats>({ totalDoctors: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [doctorMonthlyFee, setDoctorMonthlyFee] = useState(0);
  const [requestedDoctors, setRequestedDoctors] = useState(0);
  const { toast } = useToast();

  const DOCTOR_LIMIT = requestedDoctors; // Dynamic limit based on clinic's requested doctors

  // Calculate next due date (10th of next month or current month)
  const getNextDueDate = () => {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (currentDay < 10) {
      // If today is before 10th, next due date is 10th of current month
      return new Date(today.getFullYear(), today.getMonth(), 10);
    } else {
      // If today is on or after 10th, next due date is 10th of next month
      const nextMonth = addMonths(today, 1);
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 10);
    }
  };

  const nextDueDate = getNextDueDate();

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      
      setUser(currentUser);

      // Fetch clinic data
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("clinic_name, no_of_doctors, requested_doctors")
        .eq("id", currentUser.id)
        .single();

      if (clinicError) throw clinicError;
      setClinic(clinicData);
      setRequestedDoctors(clinicData.requested_doctors || 0);

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          profiles(full_name, email)
        `)
        .eq("clinic_id", currentUser.id);

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);

      // Fetch total patients created by all doctors in this clinic
      const doctorIds = doctorsData?.map(d => d.id) || [];
      let patientCount = 0;
      
      if (doctorIds.length > 0) {
        const { count, error: patientsError } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .in("created_by", doctorIds);

        if (!patientsError && count !== null) {
          patientCount = count;
        }
      }

      setStats({
        totalDoctors: doctorsData?.length || 0,
        totalPatients: patientCount,
      });

      // Fetch doctor monthly fee and requested doctors
      const { data: feeData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "doctor_monthly_fee")
        .single();

      if (feeData) {
        setDoctorMonthlyFee(parseFloat(feeData.value) || 0);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canAddMoreDoctors = doctors.length < DOCTOR_LIMIT;
  const isAtLimit = doctors.length >= DOCTOR_LIMIT;
  const today = format(new Date(), "EEEE, dd MMM yyyy");

  if (loading) {
    return <DashboardSkeleton statsCount={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      <TrialBanner userType="clinic" />
      
      {/* Compact Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-info/10 via-info/5 to-background p-4 border border-info/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center shadow-sm">
              <img 
                src={clinicLogo} 
                alt="MedCare Pro" 
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
                  <Activity className="h-3 w-3 text-info animate-pulse" />
                  <span className="text-xs font-semibold text-info">Clinic Mode</span>
                </div>
                <Sparkles className="h-4 w-4 text-warning animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome {clinic?.clinic_name || "Clinic"}
              </h2>
            </div>
          </div>
          <div className="text-right bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/40">
            <p className="text-xs text-muted-foreground">{today}</p>
            <p className="text-lg font-bold text-info">{doctors.length}/{DOCTOR_LIMIT} <span className="text-xs font-normal text-muted-foreground">doctors</span></p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clinic Name</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{clinic?.clinic_name || "Loading..."}</div>
            <p className="text-xs text-muted-foreground">Your clinic identity</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{doctors.length} / {DOCTOR_LIMIT}</div>
            <p className="text-xs text-muted-foreground">{DOCTOR_LIMIT - doctors.length} slots available</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">All clinic patients</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Due Date</CardTitle>
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{format(nextDueDate, "MMM dd, yyyy")}</div>
            <p className="text-xs text-muted-foreground">Monthly payment due</p>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Limit Alert */}
      {isAtLimit && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You've reached your doctor limit ({DOCTOR_LIMIT} doctors). To add more doctors, please contact support and request a limit increase.
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Charts */}
      <ClinicAnalyticsCharts />

      {/* Quick Actions */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Quick actions</CardTitle>
            <span className="text-sm text-muted-foreground">Shortcuts</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => navigate("/clinic/add-doctor")}
              disabled={!canAddMoreDoctors}
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-success" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Add new doctor</div>
                  <div className="text-sm text-muted-foreground">Register a new doctor to your clinic</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/clinic/support")}
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <LifeBuoy className="h-5 w-5 text-warning" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Contact support</div>
                  <div className="text-sm text-muted-foreground">Get help or request capacity increase</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDashboard;
