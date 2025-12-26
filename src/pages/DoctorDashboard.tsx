import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, UserPlus, ClipboardList, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import DoctorAnalyticsCharts from "@/components/DoctorAnalyticsCharts";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import TrialBanner from "@/components/TrialBanner";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalRecords: 0,
    waitlistPatients: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];

        const [patientsRes, totalAppointmentsRes, todayAppointmentsRes, waitlistRes, profileRes] = await Promise.all([
          supabase.from("patients").select("id", { count: "exact", head: true }).eq("created_by", user.id),
          supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id),
          supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("appointment_date", today),
          supabase.from("wait_list").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("status", "active"),
          supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        ]);

        if (profileRes.data) {
          setDoctorName(profileRes.data.full_name);
        }

        setStats({
          totalPatients: patientsRes.count || 0,
          todayAppointments: todayAppointmentsRes.count || 0,
          totalAppointments: totalAppointmentsRes.count || 0,
          pendingAppointments: 0,
          totalRecords: 0,
          waitlistPatients: waitlistRes.count || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const today = format(new Date(), "EEEE, dd MMM yyyy");

  if (loading) {
    return <DashboardSkeleton statsCount={4} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Trial Banner for Single Doctors */}
      <TrialBanner userType="doctor" />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <Activity className="h-3 w-3 mr-1" />
              Doctor Mode
            </Badge>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-1">Welcome Dr. {doctorName}</h2>
          <p className="text-muted-foreground text-base">
            Overview of your patients, appointments & waitlist in one glance.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today: <span className="font-semibold text-foreground">{today}</span></p>
          <p className="text-sm text-muted-foreground mt-1">
            Next: <span className="font-semibold text-foreground">{stats.todayAppointments} appointments</span> scheduled
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctor/patients")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">All registered patients</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctor/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled & completed</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctor/appointments")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctor/waitlist")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waitlist Patients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{stats.waitlistPatients}</div>
            <p className="text-xs text-muted-foreground">Needs follow-up slot</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <DoctorAnalyticsCharts />

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
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/doctor/appointments")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">New appointment</div>
                  <div className="text-sm text-muted-foreground">Schedule patient visit</div>
                </div>
                <kbd className="text-xs px-2 py-1 bg-muted rounded border">⌘ + N</kbd>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/doctor/patients")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-success" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Add new patient</div>
                  <div className="text-sm text-muted-foreground">Register new patient</div>
                </div>
                <kbd className="text-xs px-2 py-1 bg-muted rounded border">⌘ + P</kbd>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
              onClick={() => navigate("/doctor/waitlist")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-5 w-5 text-warning" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">View waitlist</div>
                  <div className="text-sm text-muted-foreground">{stats.waitlistPatients} pending</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
