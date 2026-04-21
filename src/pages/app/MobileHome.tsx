import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Calendar, Users, Clock, BarChart3, Activity, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const MobileHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ today: 0, total: 0, patients: 0, waitlist: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split("T")[0];

      const [p, t, td, wl] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("created_by", user.id),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("appointment_date", today),
        supabase.from("wait_list").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).eq("status", "active"),
      ]);
      setStats({
        patients: p.count || 0,
        total: t.count || 0,
        today: td.count || 0,
        waitlist: wl.count || 0,
      });
    };
    load();
  }, []);

  const tiles = [
    { label: "Today", value: stats.today, icon: Clock, color: "bg-destructive/10 text-destructive", path: "/app/appointments" },
    { label: "All Appts", value: stats.total, icon: Calendar, color: "bg-info/10 text-info", path: "/app/appointments" },
    { label: "Patients", value: stats.patients, icon: Users, color: "bg-primary/10 text-primary", path: "/app/patients" },
    { label: "Waitlist", value: stats.waitlist, icon: Activity, color: "bg-warning/10 text-warning", path: "/app/appointments" },
  ];

  return (
    <MobileAppShell title="Dashboard">
      <p className="text-xs text-muted-foreground mb-3">{format(new Date(), "EEEE, dd MMM yyyy")}</p>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card
              key={t.label}
              onClick={() => navigate(t.path)}
              className="p-4 active:scale-[0.97] transition-transform cursor-pointer border-border/50"
            >
              <div className={`h-10 w-10 rounded-xl ${t.color} flex items-center justify-center mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold">{t.value}</div>
              <div className="text-xs text-muted-foreground">{t.label}</div>
            </Card>
          );
        })}
      </div>

      <h2 className="text-sm font-semibold mt-6 mb-2 text-muted-foreground uppercase tracking-wide">Quick actions</h2>
      <div className="space-y-2">
        {[
          { label: "View Reports & Analytics", icon: BarChart3, path: "/app/reports" },
          { label: "Today's Appointments", icon: Calendar, path: "/app/appointments" },
          { label: "All Patients", icon: Users, path: "/app/patients" },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Card
              key={a.label}
              onClick={() => navigate(a.path)}
              className="p-4 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer border-border/50"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 font-medium text-sm">{a.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          );
        })}
      </div>
    </MobileAppShell>
  );
};

export default MobileHome;
