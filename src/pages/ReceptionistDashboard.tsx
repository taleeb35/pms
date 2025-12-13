import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Building2, UserPlus, Clock, Activity, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import clinicLogo from "@/assets/clinic-logo.png";
import ClinicAnalyticsCharts from "@/components/ClinicAnalyticsCharts";

interface ClinicInfo {
  clinic_name: string;
}

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [receptionistName, setReceptionistName] = useState("");
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get receptionist profile name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setReceptionistName(profileData.full_name);
      }

      // Get receptionist's clinic
      const { data: receptionistData, error: receptionistError } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id")
        .eq("user_id", user.id)
        .single();

      if (receptionistError) throw receptionistError;
      
      setClinicId(receptionistData.clinic_id);

      // Get clinic info
      const { data: clinic, error: clinicError } = await supabase
        .from("clinics")
        .select("clinic_name")
        .eq("id", receptionistData.clinic_id)
        .single();

      if (clinicError) throw clinicError;
      setClinicInfo(clinic);

      // Get doctors in clinic
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id")
        .eq("clinic_id", receptionistData.clinic_id);

      if (doctorsError) throw doctorsError;

      const doctorIds = doctors?.map((d) => d.id) || [];

      // Get total patients
      let totalPatients = 0;
      if (doctorIds.length > 0) {
        const { count } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true })
          .in("created_by", doctorIds);
        totalPatients = count || 0;
      }

      // Get today's appointments
      let todayAppointments = 0;
      const today = format(new Date(), "yyyy-MM-dd");
      if (doctorIds.length > 0) {
        const { count } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .in("doctor_id", doctorIds)
          .eq("appointment_date", today);
        todayAppointments = count || 0;
      }

      setStats({
        totalDoctors: doctors?.length || 0,
        totalPatients,
        todayAppointments,
      });
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

  const today = format(new Date(), "EEEE, dd MMM yyyy");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-info/10 via-info/5 to-background p-4 border border-info/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-info/20 to-info/5 flex items-center justify-center shadow-sm">
              <img src={clinicLogo} alt="MedCare Pro" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
                  <Activity className="h-3 w-3 text-info animate-pulse" />
                  <span className="text-xs font-semibold text-info">Receptionist Mode</span>
                </div>
                <Sparkles className="h-4 w-4 text-warning animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome {receptionistName || "Receptionist"}
              </h2>
              <p className="text-sm text-muted-foreground">{clinicInfo?.clinic_name}</p>
            </div>
          </div>
          <div className="text-right bg-card/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/40">
            <p className="text-xs text-muted-foreground">{today}</p>
            <p className="text-lg font-bold text-info">{stats.todayAppointments} <span className="text-xs font-normal text-muted-foreground">appointments today</span></p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clinic</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{clinicInfo?.clinic_name || "Loading..."}</div>
            <p className="text-xs text-muted-foreground">Your workplace</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doctors</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalDoctors}</div>
            <p className="text-xs text-muted-foreground">Active doctors</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Total patients</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments today</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {clinicId && <ClinicAnalyticsCharts clinicId={clinicId} />}

      {/* Quick Actions */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => navigate("/receptionist/walk-in")}
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-success" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Walk-In Appointment</div>
                  <div className="text-sm text-muted-foreground">Register new patient & book appointment</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/receptionist/appointments")}
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-info" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">View Appointments</div>
                  <div className="text-sm text-muted-foreground">Manage all clinic appointments</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;
