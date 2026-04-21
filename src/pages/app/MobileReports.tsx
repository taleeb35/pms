import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type Period = "7" | "30" | "90";

const calcAge = (dob: string) => {
  const b = new Date(dob);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

const MobileReports = () => {
  const [period, setPeriod] = useState<Period>("30");
  const [stats, setStats] = useState({
    apptsThisMonth: 0,
    apptsLast7: 0,
    newPatients: 0,
    revenue: 0,
  });
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; total: number }[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

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

      const revenue = (rev.data || []).reduce((s: number, r: any) => s + (Number(r.total_fee) || 0), 0);
      setStats({
        apptsThisMonth: m.count || 0,
        apptsLast7: l7.count || 0,
        newPatients: np.count || 0,
        revenue,
      });

      // patients for demographic charts
      const { data: ps } = await supabase
        .from("patients")
        .select("gender, date_of_birth")
        .eq("created_by", user.id);
      setPatients(ps || []);
    };
    load();
  }, []);

  useEffect(() => {
    const loadRevenue = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const days = parseInt(period);
      const startDate = subDays(new Date(), days - 1);
      const { data } = await supabase
        .from("appointments")
        .select("appointment_date, total_fee")
        .eq("doctor_id", user.id)
        .eq("status", "completed")
        .gte("appointment_date", format(startDate, "yyyy-MM-dd"))
        .lte("appointment_date", format(new Date(), "yyyy-MM-dd"));

      const grouped: Record<string, number> = {};
      for (let i = days - 1; i >= 0; i--) {
        grouped[format(subDays(new Date(), i), "yyyy-MM-dd")] = 0;
      }
      (data || []).forEach((a: any) => {
        if (a.appointment_date && grouped[a.appointment_date] !== undefined) {
          grouped[a.appointment_date] += Number(a.total_fee) || 0;
        }
      });
      setRevenueSeries(Object.entries(grouped).map(([date, total]) => ({ date, total })));
    };
    loadRevenue();
  }, [period]);

  const cards = [
    { label: "Revenue (this month)", value: `PKR ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "bg-success/10 text-success" },
    { label: "Appointments (this month)", value: stats.apptsThisMonth, icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: "Last 7 days", value: stats.apptsLast7, icon: TrendingUp, color: "bg-info/10 text-info" },
    { label: "New patients", value: stats.newPatients, icon: Users, color: "bg-warning/10 text-warning" },
  ];

  // Chart datasets
  const male = patients.filter((p) => p.gender === "male").length;
  const female = patients.filter((p) => p.gender === "female").length;
  const other = patients.filter((p) => p.gender === "other").length;

  const ageGroups = { "0-18": 0, "19-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
  patients.forEach((p) => {
    if (!p.date_of_birth) return;
    const a = calcAge(p.date_of_birth);
    if (a <= 18) ageGroups["0-18"]++;
    else if (a <= 30) ageGroups["19-30"]++;
    else if (a <= 45) ageGroups["31-45"]++;
    else if (a <= 60) ageGroups["46-60"]++;
    else ageGroups["60+"]++;
  });

  const revenueChart = {
    labels: revenueSeries.map((d) => format(new Date(d.date), "dd MMM")),
    datasets: [
      {
        label: "Revenue",
        data: revenueSeries.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const genderChart = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: [male, female, other],
        backgroundColor: ["rgba(59,130,246,0.85)", "rgba(236,72,153,0.85)", "rgba(168,85,247,0.85)"],
        borderWidth: 0,
      },
    ],
  };

  const ageChart = {
    labels: Object.keys(ageGroups),
    datasets: [
      {
        label: "Patients",
        data: Object.values(ageGroups),
        backgroundColor: "rgba(16, 185, 129, 0.75)",
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const compactOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } }, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }, grid: { display: false } },
    },
  } as const;

  const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { padding: 12, usePointStyle: true, font: { size: 11 } } },
    },
  };

  return (
    <MobileAppShell title="Reports">
      <p className="text-xs text-muted-foreground mb-3">
        End-of-day overview · {format(new Date(), "dd MMM yyyy")}
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-3 border-border/50">
              <div className={`h-9 w-9 rounded-xl ${c.color} flex items-center justify-center mb-2`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-base font-bold leading-tight">{c.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Revenue trend */}
      <Card className="p-4 mb-3 border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Revenue trend</h3>
            <p className="text-[11px] text-muted-foreground">
              PKR {revenueSeries.reduce((s, d) => s + d.total, 0).toLocaleString()} total
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[180px]">
          <Line data={revenueChart} options={compactOpts} />
        </div>
      </Card>

      {/* Gender split */}
      <Card className="p-4 mb-3 border-border/50">
        <h3 className="text-sm font-semibold mb-2">Patient gender split</h3>
        <div className="h-[200px]">
          <Doughnut data={genderChart} options={doughnutOpts} />
        </div>
      </Card>

      {/* Age distribution */}
      <Card className="p-4 mb-3 border-border/50">
        <h3 className="text-sm font-semibold mb-3">Age distribution</h3>
        <div className="h-[180px]">
          <Bar data={ageChart} options={compactOpts} />
        </div>
      </Card>
    </MobileAppShell>
  );
};

export default MobileReports;
