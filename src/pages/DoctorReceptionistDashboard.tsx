import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, Activity, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DashboardSkeleton from "@/components/DashboardSkeleton";

const DoctorReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string>("");
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyAppointments: 0,
    waitlistCount: 0,
  });

  useEffect(() => {
    const fetchDoctorAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Get the doctor this receptionist works for
        const { data: receptionistData, error: recError } = await supabase
          .from("doctor_receptionists")
          .select("doctor_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (recError || !receptionistData) {
          toast({
            title: "Error",
            description: "Could not find your associated doctor",
            variant: "destructive",
          });
          return;
        }

        const docId = receptionistData.doctor_id;
        setDoctorId(docId);

        // Get doctor name
        const { data: doctorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", docId)
          .single();

        setDoctorName(doctorProfile?.full_name || "Doctor");

        const today = format(new Date(), "yyyy-MM-dd");
        const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

        // Fetch stats in parallel
        const [patientsResult, todayApptResult, monthApptResult, waitlistResult] = await Promise.all([
          supabase
            .from("patients")
            .select("id", { count: "exact", head: true })
            .eq("created_by", docId),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", docId)
            .eq("appointment_date", today),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", docId)
            .gte("appointment_date", monthStart)
            .lte("appointment_date", monthEnd),
          supabase
            .from("wait_list")
            .select("id", { count: "exact", head: true })
            .eq("doctor_id", docId)
            .eq("status", "active"),
        ]);

        setStats({
          totalPatients: patientsResult.count || 0,
          todayAppointments: todayApptResult.count || 0,
          monthlyAppointments: monthApptResult.count || 0,
          waitlistCount: waitlistResult.count || 0,
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

    fetchDoctorAndStats();
  }, [navigate, toast]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      path: "/doctor-receptionist/patients",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
      path: "/doctor-receptionist/appointments",
    },
    {
      title: "Monthly Appointments",
      value: stats.monthlyAppointments,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      path: "/doctor-receptionist/appointments",
    },
    {
      title: "Waitlist",
      value: stats.waitlistCount,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      path: "/doctor-receptionist/waitlist",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! You're managing patients for Dr. {doctorName}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.path)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/doctor-receptionist/patients")}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Add Patient</p>
                  <p className="text-sm text-muted-foreground">Register new patient</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/doctor-receptionist/appointments")}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Schedule Appointment</p>
                  <p className="text-sm text-muted-foreground">Book new appointment</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate("/doctor-receptionist/walk-in")}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Walk-In Patient</p>
                  <p className="text-sm text-muted-foreground">Quick registration</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReceptionistDashboard;
