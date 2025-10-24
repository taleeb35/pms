import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, DollarSign } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalRecords: 0,
    pendingInvoices: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [patients, appointments, records, invoices] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("appointment_date", today),
        supabase.from("medical_records").select("id", { count: "exact", head: true }),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("payment_status", "pending"),
      ]);

      setStats({
        totalPatients: patients.count || 0,
        todayAppointments: appointments.count || 0,
        totalRecords: records.count || 0,
        pendingInvoices: invoices.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Medical Records",
      value: stats.totalRecords,
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: DollarSign,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to Patient Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent appointments and patient activities will appear here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Quick access to common tasks will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
