import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";

const MobileReports = () => {
  const [data, setData] = useState({
    apptsThisMonth: 0,
    apptsLast7: 0,
    newPatients: 0,
    revenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const last7 = format(subDays(new Date(), 7), "yyyy-MM-dd");

      const [m, l7, np, rev] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).gte("appointment_date", monthStart),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("doctor_id", user.id).gte("appointment_date", last7),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("created_by", user.id).gte("created_at", monthStart),
        supabase.from("appointments").select("total_fee").eq("doctor_id", user.id).gte("appointment_date", monthStart),
      ]);

      const revenue = (rev.data || []).reduce((sum: number, r: any) => sum + (Number(r.total_fee) || 0), 0);

      setData({
        apptsThisMonth: m.count || 0,
        apptsLast7: l7.count || 0,
        newPatients: np.count || 0,
        revenue,
      });
    };
    load();
  }, []);

  const cards = [
    { label: "Revenue (this month)", value: `PKR ${data.revenue.toLocaleString()}`, icon: DollarSign, color: "bg-success/10 text-success" },
    { label: "Appointments (this month)", value: data.apptsThisMonth, icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: "Last 7 days", value: data.apptsLast7, icon: TrendingUp, color: "bg-info/10 text-info" },
    { label: "New patients", value: data.newPatients, icon: Users, color: "bg-warning/10 text-warning" },
  ];

  return (
    <MobileAppShell title="Reports">
      <p className="text-xs text-muted-foreground mb-3">End-of-day overview · {format(new Date(), "dd MMM yyyy")}</p>
      <div className="space-y-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-4 flex items-center gap-3 border-border/50">
              <div className={`h-12 w-12 rounded-2xl ${c.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-xl font-bold">{c.value}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </MobileAppShell>
  );
};

export default MobileReports;
