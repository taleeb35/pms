import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import {
  TrendingUp, TrendingDown, Users, DollarSign, CheckCircle2, XCircle,
  Zap, Activity, Baby, Heart, Clock, Stethoscope, ShieldAlert, AlertTriangle, BarChart3,
} from "lucide-react";
import {
  format, subMonths, eachMonthOfInterval, parseISO, differenceInDays, getDay,
} from "date-fns";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  calculatePregnancyWeeks, calculateExpectedDueDate, getTrimester,
} from "@/lib/pregnancyUtils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#06b6d4"];

const MobileReports = () => {
  const dateFrom = useMemo(() => subMonths(new Date(), 6), []);
  const dateTo = useMemo(() => new Date(), []);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [icdCodes, setIcdCodes] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [isGynecologist, setIsGynecologist] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const from = format(dateFrom, "yyyy-MM-dd");
      const to = format(dateTo, "yyyy-MM-dd");

      const [apptRes, patientRes, allApptRes, medRecRes, icdRes, doctorRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, consultation_fee, procedure_fee, other_fee, total_fee, refund, appointment_type, patient_id, started_at, completed_at, icd_code_id")
          .eq("doctor_id", user.id)
          .gte("appointment_date", from)
          .lte("appointment_date", to)
          .order("appointment_date"),
        supabase
          .from("patients")
          .select("id, full_name, gender, date_of_birth, city, created_at, allergies, pregnancy_start_date")
          .eq("created_by", user.id),
        supabase
          .from("appointments")
          .select("id, appointment_date, patient_id, status")
          .eq("doctor_id", user.id),
        supabase
          .from("medical_records")
          .select("id, diagnosis, patient_id, visit_date")
          .eq("doctor_id", user.id),
        supabase
          .from("doctor_icd_codes")
          .select("id, code, description")
          .eq("doctor_id", user.id),
        supabase
          .from("doctors")
          .select("specialization")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      setAppointments(apptRes.data || []);
      setPatients(patientRes.data || []);
      setAllAppointments(allApptRes.data || []);
      setMedicalRecords(medRecRes.data || []);
      setIcdCodes(icdRes.data || []);
      const spec = doctorRes.data?.specialization?.toLowerCase() || "";
      setIsGynecologist(spec.includes("gynecol") || spec.includes("obstetr") || spec.includes("gynae"));
    };
    load();
  }, [dateFrom, dateTo]);

  // Revenue trend
  const revenueTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const ma = appointments.filter((a) => a.appointment_date?.startsWith(monthStr) && a.status !== "cancelled");
      const revenue = ma.reduce((s, a) => s + (Number(a.total_fee) || 0), 0);
      const refunds = ma.reduce((s, a) => s + (Number(a.refund) || 0), 0);
      const consultation = ma.reduce((s, a) => s + (Number(a.consultation_fee) || 0), 0);
      const procedures = ma.reduce((s, a) => s + (Number(a.procedure_fee) || 0), 0);
      return { month: format(month, "MMM yy"), revenue, refunds, net: revenue - refunds, consultation, procedures };
    });
  }, [appointments, dateFrom, dateTo]);

  const totalRevenue = revenueTrendData.reduce((s, d) => s + d.revenue, 0);
  const totalRefunds = revenueTrendData.reduce((s, d) => s + d.refunds, 0);
  const totalNet = totalRevenue - totalRefunds;

  const momGrowth = useMemo(() => {
    if (revenueTrendData.length < 2) return 0;
    const curr = revenueTrendData[revenueTrendData.length - 1]?.net || 0;
    const prev = revenueTrendData[revenueTrendData.length - 2]?.net || 0;
    return prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
  }, [revenueTrendData]);

  const yoyGrowth = useMemo(() => {
    if (revenueTrendData.length < 4) return 0;
    const half = Math.floor(revenueTrendData.length / 2);
    const a = revenueTrendData.slice(0, half).reduce((s, d) => s + d.net, 0);
    const b = revenueTrendData.slice(half).reduce((s, d) => s + d.net, 0);
    return a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
  }, [revenueTrendData]);

  const growthMetrics = useMemo(() => {
    const completed = appointments.filter((a) => a.status !== "cancelled");
    const uniquePatients = new Set(completed.map((a) => a.patient_id)).size;
    const revenuePerPatient = uniquePatients ? totalNet / uniquePatients : 0;
    const workingDays = new Set(completed.map((a) => a.appointment_date)).size;
    const dailyAvgRevenue = workingDays ? totalNet / workingDays : 0;
    const uniqueHours = new Set<string>();
    completed.forEach((a) => {
      if (a.appointment_date && a.appointment_time)
        uniqueHours.add(`${a.appointment_date}_${a.appointment_time.split(":")[0]}`);
    });
    const revenuePerHour = uniqueHours.size ? totalNet / uniqueHours.size : 0;
    return { revenuePerPatient, revenuePerHour, dailyAvgRevenue };
  }, [appointments, totalNet]);

  // Demographics
  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      const g = (p.gender || "Unknown").charAt(0).toUpperCase() + (p.gender || "Unknown").slice(1);
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const ageDistribution = useMemo(() => {
    const buckets = { "0-10": 0, "11-20": 0, "21-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "60+": 0 };
    const now = new Date();
    patients.forEach((p) => {
      if (!p.date_of_birth) return;
      const age = Math.floor((now.getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 86400000));
      if (age <= 10) buckets["0-10"]++;
      else if (age <= 20) buckets["11-20"]++;
      else if (age <= 30) buckets["21-30"]++;
      else if (age <= 40) buckets["31-40"]++;
      else if (age <= 50) buckets["41-50"]++;
      else if (age <= 60) buckets["51-60"]++;
      else buckets["60+"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [patients]);

  const cityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      const city = p.city || "Unknown";
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [patients]);

  // Retention
  const patientRetention = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    const firstVisit: Record<string, string> = {};
    [...appointments].sort((a, b) => a.appointment_date.localeCompare(b.appointment_date)).forEach((a) => {
      if (!firstVisit[a.patient_id]) firstVisit[a.patient_id] = a.appointment_date;
    });
    return months.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const ma = appointments.filter((a) => a.appointment_date?.startsWith(monthStr));
      const u = new Set(ma.map((a) => a.patient_id));
      let n = 0, r = 0;
      u.forEach((pid) => firstVisit[pid]?.startsWith(monthStr) ? n++ : r++);
      return { month: format(month, "MMM yy"), new: n, returning: r };
    });
  }, [appointments, dateFrom, dateTo]);

  // Appointments
  const apptStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const s = a.status || "scheduled";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [appointments]);

  const apptType = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const t = a.appointment_type === "follow_up" ? "Follow-up" : "New";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  const dailyVolume = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map((m) => {
      const ms = format(m, "yyyy-MM");
      return { month: format(m, "MMM yy"), appointments: appointments.filter((a) => a.appointment_date?.startsWith(ms)).length };
    });
  }, [appointments, dateFrom, dateTo]);

  const totalAppts = appointments.length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;
  const completionRate = totalAppts ? ((completedCount / totalAppts) * 100).toFixed(1) : "0";
  const cancellationRate = totalAppts ? ((cancelledCount / totalAppts) * 100).toFixed(1) : "0";

  const avgRevPerAppt = totalAppts ? Math.round(totalRevenue / totalAppts) : 0;
  const avgApptsPerMonth = revenueTrendData.length ? Math.round(totalAppts / revenueTrendData.length) : 0;

  // Gyno
  const pregnant = useMemo(() => patients.filter((p) => p.pregnancy_start_date), [patients]);
  const trimesterData = useMemo(() => {
    const buckets = [
      { name: "1st Trimester", value: 0, color: COLORS[0] },
      { name: "2nd Trimester", value: 0, color: COLORS[1] },
      { name: "3rd Trimester", value: 0, color: COLORS[2] },
    ];
    pregnant.forEach((p) => {
      const t = getTrimester(p.pregnancy_start_date);
      if (t === 1) buckets[0].value++;
      else if (t === 2) buckets[1].value++;
      else if (t === 3) buckets[2].value++;
    });
    return buckets;
  }, [pregnant]);

  const deliveryDue = useMemo(() => {
    const today = new Date();
    const counts = { "7 days": 0, "14 days": 0, "30 days": 0, "2 months": 0, "3 months": 0 };
    pregnant.forEach((p) => {
      const due = calculateExpectedDueDate(p.pregnancy_start_date);
      if (!due) return;
      const days = differenceInDays(due, today);
      if (days < 0) return;
      if (days <= 7) counts["7 days"]++;
      else if (days <= 14) counts["14 days"]++;
      else if (days <= 30) counts["30 days"]++;
      else if (days <= 60) counts["2 months"]++;
      else if (days <= 90) counts["3 months"]++;
    });
    return Object.entries(counts).map(([range, count]) => ({ range, count }));
  }, [pregnant]);

  // Avg consultation time per month
  const consultationTimeData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const ma = appointments.filter((a) => a.appointment_date?.startsWith(monthStr) && a.started_at && a.completed_at && a.status === "completed");
      const durations = ma
        .map((a) => Math.max(0, (new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()) / 60000))
        .filter((d) => d > 0 && d < 300);
      const avg = durations.length ? parseFloat((durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1)) : 0;
      return { month: format(month, "MMM yy"), avg };
    });
  }, [appointments, dateFrom, dateTo]);

  const overallAvgTime = useMemo(() => {
    const all = appointments
      .filter((a) => a.started_at && a.completed_at && a.status === "completed")
      .map((a) => Math.max(0, (new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()) / 60000))
      .filter((d) => d > 0 && d < 300);
    return all.length ? parseFloat((all.reduce((s, d) => s + d, 0) / all.length).toFixed(1)) : 0;
  }, [appointments]);

  // Peak hours heatmap
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, Record<string, number>> = {};
    days.forEach((d) => (counts[d] = {}));
    appointments.forEach((a) => {
      if (!a.appointment_date || !a.appointment_time) return;
      const day = days[getDay(parseISO(a.appointment_date))];
      const hour = `${a.appointment_time.split(":")[0]}:00`;
      counts[day][hour] = (counts[day][hour] || 0) + 1;
    });
    const allHours = new Set<string>();
    Object.values(counts).forEach((h) => Object.keys(h).forEach((k) => allHours.add(k)));
    const sorted = Array.from(allHours).sort();
    const max = Math.max(1, ...sorted.flatMap((h) => days.map((d) => counts[d][h] || 0)));
    return { hours: sorted, days, counts, max };
  }, [appointments]);

  // Visit frequency
  const visitFrequency = useMemo(() => {
    const map: Record<string, { name: string; visits: number }> = {};
    allAppointments.forEach((a) => {
      if (!map[a.patient_id]) {
        const p = patients.find((pt) => pt.id === a.patient_id);
        map[a.patient_id] = { name: p?.full_name || "Unknown", visits: 0 };
      }
      map[a.patient_id].visits++;
    });
    const all = Object.values(map);
    const avg = all.length ? parseFloat((all.reduce((s, p) => s + p.visits, 0) / all.length).toFixed(1)) : 0;
    const top = [...all].sort((a, b) => b.visits - a.visits).slice(0, 5);
    const dist: Record<string, number> = { "1": 0, "2-3": 0, "4-5": 0, "6-10": 0, "10+": 0 };
    all.forEach((p) => {
      if (p.visits === 1) dist["1"]++;
      else if (p.visits <= 3) dist["2-3"]++;
      else if (p.visits <= 5) dist["4-5"]++;
      else if (p.visits <= 10) dist["6-10"]++;
      else dist["10+"]++;
    });
    return {
      avg,
      top,
      total: all.length,
      distribution: Object.entries(dist).map(([range, count]) => ({ range, count })),
    };
  }, [allAppointments, patients]);

  // Drop-off
  const dropOff = useMemo(() => {
    const today = new Date();
    const last: Record<string, { name: string; daysSince: number }> = {};
    allAppointments.filter((a) => a.status === "completed").forEach((a) => {
      const p = patients.find((pt) => pt.id === a.patient_id);
      const days = differenceInDays(today, parseISO(a.appointment_date));
      if (!last[a.patient_id] || days < last[a.patient_id].daysSince) {
        last[a.patient_id] = { name: p?.full_name || "Unknown", daysSince: days };
      }
    });
    const all = Object.values(last);
    const r30 = all.filter((p) => p.daysSince >= 30 && p.daysSince < 60).length;
    const r60 = all.filter((p) => p.daysSince >= 60 && p.daysSince < 90).length;
    const r90 = all.filter((p) => p.daysSince >= 90).length;
    return {
      summary: [
        { range: "30-60d", count: r30 },
        { range: "60-90d", count: r60 },
        { range: "90+d", count: r90 },
      ],
      total: r30 + r60 + r90,
    };
  }, [allAppointments, patients]);

  // Top diseases
  const topDiseases = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      if (a.icd_code_id) {
        const icd = icdCodes.find((c) => c.id === a.icd_code_id);
        if (icd) {
          const lbl = `${icd.code} - ${icd.description}`;
          counts[lbl] = (counts[lbl] || 0) + 1;
        }
      }
    });
    medicalRecords.forEach((r) => {
      if (r.diagnosis?.trim()) counts[r.diagnosis.trim()] = (counts[r.diagnosis.trim()] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.length > 28 ? name.slice(0, 25) + "…" : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [appointments, icdCodes, medicalRecords]);

  // Allergy distribution
  const allergyDist = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      if (p.allergies) {
        p.allergies.split(/[,;]+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean).forEach((a: string) => {
          const n = a.charAt(0).toUpperCase() + a.slice(1);
          counts[n] = (counts[n] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [patients]);

  const fmtPKR = (n: number) => `Rs ${n.toLocaleString()}`;
  const tickFont = { fontSize: 10 };

  return (
    <MobileAppShell title="Reports">
      <p className="text-xs text-muted-foreground mb-3">
        {format(dateFrom, "dd MMM yyyy")} – {format(dateTo, "dd MMM yyyy")}
      </p>

      {/* TOP KPIs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Card className="p-3 border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Net Revenue</div>
          <div className="text-lg font-bold mt-0.5">{fmtPKR(totalNet)}</div>
          <div className={`text-[10px] flex items-center gap-1 mt-1 ${momGrowth >= 0 ? "text-success" : "text-destructive"}`}>
            {momGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {momGrowth.toFixed(1)}% vs last month
          </div>
        </Card>
        <Card className="p-3 border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Patients</div>
          <div className="text-lg font-bold mt-0.5">{patients.length}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{genderData.find((g) => g.name === "Female")?.value || 0} female</div>
        </Card>
        <Card className="p-3 border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Completion Rate</div>
          <div className="text-lg font-bold mt-0.5">{completionRate}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">{totalAppts} total appointments</div>
        </Card>
        <Card className="p-3 border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Cancellation Rate</div>
          <div className="text-lg font-bold mt-0.5 text-destructive">{cancellationRate}%</div>
          <div className="text-[10px] text-muted-foreground mt-1">{cancelledCount} cancelled</div>
        </Card>
      </div>

      {/* GROWTH METRICS */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Growth Metrics</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">Key indicators for practice growth</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground">Revenue / Patient</div>
            <div className="text-sm font-bold">{fmtPKR(Math.round(growthMetrics.revenuePerPatient))}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground">Revenue / Hour</div>
            <div className="text-sm font-bold">{fmtPKR(Math.round(growthMetrics.revenuePerHour))}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground">Daily Avg Revenue</div>
            <div className="text-sm font-bold">{fmtPKR(Math.round(growthMetrics.dailyAvgRevenue))}</div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-[10px] text-muted-foreground">Month-over-Month</div>
            <div className={`text-sm font-bold ${momGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {momGrowth >= 0 ? "+" : ""}{momGrowth.toFixed(1)}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 col-span-2">
            <div className="text-[10px] text-muted-foreground">Period Growth</div>
            <div className={`text-sm font-bold ${yoyGrowth >= 0 ? "text-success" : "text-destructive"}`}>
              {yoyGrowth >= 0 ? "+" : ""}{yoyGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>

      {/* REVENUE TREND */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold">Revenue Trend</h3>
        <p className="text-[11px] text-muted-foreground mb-2">Consultation vs Procedures</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={tickFont} />
              <YAxis tick={tickFont} width={50} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="consultation" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.7} name="Consultation" />
              <Area type="monotone" dataKey="procedures" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.7} name="Procedures" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* GENDER */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-2">Gender Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} label={(e: any) => `${e.name} ${((e.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AGE */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-2">Age Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="range" tick={tickFont} />
              <YAxis tick={tickFont} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* TOP CITIES */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-2">Top Cities</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" tick={tickFont} />
              <YAxis type="category" dataKey="city" tick={tickFont} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* NEW VS RETURNING */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold">New vs Returning Patients</h3>
        <p className="text-[11px] text-muted-foreground mb-2">Patient retention over time</p>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patientRetention}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={tickFont} />
              <YAxis tick={tickFont} width={30} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="new" stackId="a" fill="#6366f1" name="New" radius={[0, 0, 0, 0]} />
              <Bar dataKey="returning" stackId="a" fill="#10b981" name="Returning" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* APPOINTMENT VOLUME */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold">Appointment Volume</h3>
        <p className="text-[11px] text-muted-foreground mb-2">Monthly trends</p>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={tickFont} />
              <YAxis tick={tickFont} width={30} />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* STATUS BREAKDOWN */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-2">Appointment Status Breakdown</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={apptStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} label={(e: any) => `${e.name} ${((e.percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                {apptStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* NEW VS FOLLOW-UP */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-2">New vs Follow-up</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={apptType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} label={(e: any) => `${e.name}: ${e.value}`} labelLine={false}>
                {apptType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* QUICK STATS */}
      <Card className="p-3 mb-4 border-border/50">
        <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
        <div className="space-y-2">
          {[
            { label: "Avg Revenue / Appointment", value: fmtPKR(avgRevPerAppt) },
            { label: "Avg Revenue / Patient", value: fmtPKR(Math.round(growthMetrics.revenuePerPatient)) },
            { label: "Avg Appointments / Month", value: avgApptsPerMonth },
            { label: "Total Refunds", value: fmtPKR(totalRefunds), danger: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className={`text-sm font-bold ${s.danger ? "text-destructive" : ""}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AVG CONSULTATION TIME */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Avg Consultation Time</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">Overall: <span className="font-semibold text-foreground">{overallAvgTime} min</span></p>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={consultationTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={tickFont} />
              <YAxis tick={tickFont} width={30} unit="m" />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} name="Avg (min)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* PEAK HOURS HEATMAP */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Peak Hours</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">Day × Hour appointment density</p>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="text-[9px] border-collapse">
            <thead>
              <tr>
                <th className="px-1.5 py-1 text-left font-medium text-muted-foreground sticky left-0 bg-card">Hour</th>
                {heatmapData.days.map((d) => (
                  <th key={d} className="px-1.5 py-1 text-center font-medium text-muted-foreground">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.hours.map((h) => (
                <tr key={h}>
                  <td className="px-1.5 py-0.5 font-medium sticky left-0 bg-card">{h}</td>
                  {heatmapData.days.map((d) => {
                    const v = heatmapData.counts[d][h] || 0;
                    const op = v ? 0.15 + (v / heatmapData.max) * 0.75 : 0;
                    return (
                      <td key={d} className="px-1.5 py-0.5 text-center" style={{ backgroundColor: v ? `rgba(99,102,241,${op})` : "transparent", color: op > 0.5 ? "white" : undefined }}>
                        {v || ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* VISIT FREQUENCY */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Patient Visit Frequency</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">Avg <span className="font-semibold text-foreground">{visitFrequency.avg}</span> visits / patient · {visitFrequency.total} patients</p>
        <div className="h-[180px] mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitFrequency.distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="range" tick={tickFont} />
              <YAxis tick={tickFont} width={30} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {visitFrequency.top.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Top Recurring</div>
            {visitFrequency.top.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs truncate">{i + 1}. {p.name}</span>
                <span className="text-xs font-bold text-primary">{p.visits} visits</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* DROP-OFF */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-semibold">Patient Drop-off</h3>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">At-risk patients: <span className="font-semibold text-destructive">{dropOff.total}</span></p>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dropOff.summary}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="range" tick={tickFont} />
              <YAxis tick={tickFont} width={30} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {dropOff.summary.map((_, i) => <Cell key={i} fill={["#f59e0b", "#ec4899", "#ef4444"][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* TOP DISEASES */}
      {topDiseases.length > 0 && (
        <Card className="p-3 mb-4 border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Top Diseases / Diagnoses</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Most frequent in this period</p>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDiseases} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" tick={tickFont} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* ALLERGY DISTRIBUTION */}
      {allergyDist.length > 0 && (
        <Card className="p-3 mb-4 border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">Allergy Distribution</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Common allergies among patients</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allergyDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" tick={tickFont} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* GYNO ONLY */}
      {isGynecologist && (
        <>
          <Card className="p-3 mb-4 border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Baby className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Trimester Distribution</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Total Pregnant Patients: {pregnant.length}</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={trimesterData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} label={(e: any) => e.value} labelLine={false}>
                    {trimesterData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-3 mb-4 border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Delivery Due</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Patients with upcoming expected delivery</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryDue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="range" tick={{ fontSize: 9 }} />
                  <YAxis tick={tickFont} width={30} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {deliveryDue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </MobileAppShell>
  );
};

export default MobileReports;
