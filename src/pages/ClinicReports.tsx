import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, eachMonthOfInterval, getDay, parseISO, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Download, BarChart3, Star, Award, Zap } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
];

interface DoctorInfo {
  id: string;
  full_name: string;
  specialization: string;
  clinic_percentage: number | null;
}

const ClinicReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const from = format(dateFrom, "yyyy-MM-dd");
      const to = format(dateTo, "yyyy-MM-dd");

      // Get clinic doctors
      const { data: doctorsData } = await supabase
        .from("doctors")
        .select("id, specialization, clinic_percentage")
        .eq("clinic_id", user.id)
        .eq("approved", true);

      const doctorIds = (doctorsData || []).map(d => d.id);

      // Get doctor names
      let doctorInfos: DoctorInfo[] = [];
      if (doctorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", doctorIds);

        doctorInfos = (doctorsData || []).map(d => ({
          id: d.id,
          full_name: profiles?.find(p => p.id === d.id)?.full_name || "Unknown",
          specialization: d.specialization,
          clinic_percentage: d.clinic_percentage,
        }));
      }

      // Fetch appointments, patients, expenses in parallel
      const [apptRes, patientRes, expenseRes] = await Promise.all([
        doctorIds.length > 0
          ? supabase
              .from("appointments")
              .select("id, appointment_date, appointment_time, status, consultation_fee, procedure_fee, other_fee, total_fee, refund, appointment_type, patient_id, doctor_id, duration_minutes")
              .in("doctor_id", doctorIds)
              .gte("appointment_date", from)
              .lte("appointment_date", to)
              .order("appointment_date")
          : Promise.resolve({ data: [] }),
        supabase
          .from("patients")
          .select("id, full_name, gender, date_of_birth, city, created_at, created_by"),
        supabase
          .from("clinic_expenses")
          .select("id, amount, category, expense_date")
          .eq("clinic_id", user.id)
          .gte("expense_date", from)
          .lte("expense_date", to),
      ]);

      // Filter patients belonging to clinic doctors
      const clinicPatients = (patientRes.data || []).filter(p => doctorIds.includes(p.created_by));

      setDoctors(doctorInfos);
      setAppointments(apptRes.data || []);
      setPatients(clinicPatients);
      setExpenses(expenseRes.data || []);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======= REVENUE TREND (P&L) =======
  const revenueTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthAppts = appointments.filter(a => a.appointment_date?.startsWith(monthStr) && a.status !== "cancelled");
      const revenue = monthAppts.reduce((sum, a) => sum + (Number(a.total_fee) || 0), 0);
      const refunds = monthAppts.reduce((sum, a) => sum + (Number(a.refund) || 0), 0);
      const monthExpenses = expenses.filter(e => e.expense_date?.startsWith(monthStr)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      return {
        month: format(month, "MMM yyyy"),
        revenue,
        refunds,
        expenses: monthExpenses,
        profit: revenue - refunds - monthExpenses,
      };
    });
  }, [appointments, expenses, dateFrom, dateTo]);

  const totalRevenue = revenueTrendData.reduce((s, d) => s + d.revenue, 0);
  const totalRefunds = revenueTrendData.reduce((s, d) => s + d.refunds, 0);
  const totalExpenses = revenueTrendData.reduce((s, d) => s + d.expenses, 0);
  const totalProfit = totalRevenue - totalRefunds - totalExpenses;

  const revenueGrowth = useMemo(() => {
    if (revenueTrendData.length < 2) return 0;
    const current = revenueTrendData[revenueTrendData.length - 1]?.profit || 0;
    const previous = revenueTrendData[revenueTrendData.length - 2]?.profit || 1;
    return ((current - previous) / Math.abs(previous) * 100);
  }, [revenueTrendData]);

  // ======= GROWTH METRICS =======
  const growthMetrics = useMemo(() => {
    const completedAppts = appointments.filter(a => a.status !== "cancelled");
    const uniquePatients = new Set(completedAppts.map(a => a.patient_id)).size;
    const netRev = totalRevenue - totalRefunds;
    const revenuePerPatient = uniquePatients > 0 ? netRev / uniquePatients : 0;
    const workingDays = new Set(completedAppts.map(a => a.appointment_date)).size;
    const dailyAvgRevenue = workingDays > 0 ? netRev / workingDays : 0;
    const uniqueHours = new Set<string>();
    completedAppts.forEach(a => {
      if (a.appointment_date && a.appointment_time) uniqueHours.add(`${a.appointment_date}_${a.appointment_time.split(":")[0]}`);
    });
    const revenuePerHour = uniqueHours.size > 0 ? netRev / uniqueHours.size : 0;
    const momGrowth = revenueTrendData.length >= 2 ? (() => {
      const curr = revenueTrendData[revenueTrendData.length - 1]?.profit || 0;
      const prev = revenueTrendData[revenueTrendData.length - 2]?.profit || 0;
      return prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
    })() : 0;
    const yoyGrowth = revenueTrendData.length >= 4 ? (() => {
      const half = Math.floor(revenueTrendData.length / 2);
      const firstHalf = revenueTrendData.slice(0, half).reduce((s, d) => s + (d.profit || 0), 0);
      const secondHalf = revenueTrendData.slice(half).reduce((s, d) => s + (d.profit || 0), 0);
      return firstHalf !== 0 ? ((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100 : 0;
    })() : 0;
    return { revenuePerPatient, revenuePerHour, dailyAvgRevenue, momGrowth, yoyGrowth };
  }, [appointments, totalRevenue, totalRefunds, revenueTrendData]);

  // ======= DOCTOR PERFORMANCE SCORECARD =======
  const doctorScorecard = useMemo(() => {
    return doctors.map(doc => {
      const docAppts = appointments.filter(a => a.doctor_id === doc.id);
      const completed = docAppts.filter(a => a.status === "completed").length;
      const cancelled = docAppts.filter(a => a.status === "cancelled").length;
      const totalFees = docAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + (Number(a.total_fee) || 0), 0);
      const totalRefund = docAppts.reduce((s, a) => s + (Number(a.refund) || 0), 0);
      const netRevenue = totalFees - totalRefund;
      const clinicShare = doc.clinic_percentage ? netRevenue * (doc.clinic_percentage / 100) : 0;
      const docPatients = new Set(docAppts.map(a => a.patient_id)).size;
      const completionRate = docAppts.length > 0 ? ((completed / docAppts.length) * 100).toFixed(0) : "0";
      const cancelRate = docAppts.length > 0 ? ((cancelled / docAppts.length) * 100).toFixed(0) : "0";

      return {
        ...doc,
        totalAppointments: docAppts.length,
        completed,
        cancelled,
        totalRevenue: netRevenue,
        clinicShare,
        doctorShare: netRevenue - clinicShare,
        patients: docPatients,
        completionRate,
        cancelRate,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [doctors, appointments]);

  // ======= PATIENT DEMOGRAPHICS =======
  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => { counts[p.gender || "Unknown"] = (counts[p.gender || "Unknown"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const ageDistribution = useMemo(() => {
    const buckets = { "0-10": 0, "11-20": 0, "21-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "60+": 0 };
    const now = new Date();
    patients.forEach(p => {
      if (!p.date_of_birth) return;
      const age = Math.floor((now.getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
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

  // ======= NEW VS RETURNING =======
  const patientRetention = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    const firstVisit: Record<string, string> = {};
    [...appointments].sort((a, b) => a.appointment_date.localeCompare(b.appointment_date)).forEach(a => {
      if (!firstVisit[a.patient_id]) firstVisit[a.patient_id] = a.appointment_date;
    });
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthAppts = appointments.filter(a => a.appointment_date?.startsWith(monthStr));
      const uniquePatients = new Set(monthAppts.map(a => a.patient_id));
      let newP = 0, returning = 0;
      uniquePatients.forEach(pid => {
        if (firstVisit[pid]?.startsWith(monthStr)) newP++; else returning++;
      });
      return { month: format(month, "MMM yy"), new: newP, returning };
    });
  }, [appointments, dateFrom, dateTo]);

  // ======= APPOINTMENT ANALYTICS =======
  const appointmentStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => { counts[a.status || "scheduled"] = (counts[a.status || "scheduled"] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [appointments]);

  const noShowRate = appointments.length > 0 ? ((appointments.filter(a => a.status === "cancelled").length / appointments.length) * 100).toFixed(1) : "0";
  const completionRate = appointments.length > 0 ? ((appointments.filter(a => a.status === "completed").length / appointments.length) * 100).toFixed(1) : "0";

  // Heatmap
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hourCounts: Record<string, Record<string, number>> = {};
    days.forEach(d => { hourCounts[d] = {}; });
    appointments.forEach(a => {
      if (!a.appointment_date || !a.appointment_time) return;
      const dayName = days[getDay(parseISO(a.appointment_date))];
      const hour = a.appointment_time.split(":")[0] + ":00";
      hourCounts[dayName][hour] = (hourCounts[dayName][hour] || 0) + 1;
    });
    const allHours = new Set<string>();
    Object.values(hourCounts).forEach(h => Object.keys(h).forEach(k => allHours.add(k)));
    return Array.from(allHours).sort().map(hour => {
      const row: Record<string, any> = { hour };
      days.forEach(d => { row[d] = hourCounts[d][hour] || 0; });
      return row;
    });
  }, [appointments]);

  // Revenue by specialization
  const revenueBySpecialization = useMemo(() => {
    const specMap: Record<string, number> = {};
    doctors.forEach(doc => {
      const docAppts = appointments.filter(a => a.doctor_id === doc.id && a.status !== "cancelled");
      const rev = docAppts.reduce((s, a) => s + (Number(a.total_fee) || 0), 0);
      specMap[doc.specialization] = (specMap[doc.specialization] || 0) + rev;
    });
    return Object.entries(specMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [doctors, appointments]);

  // Expense categories
  const expenseByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + Number(e.amount); });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Clinic Analytics Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${format(dateFrom, "dd MMM yyyy")} - ${format(dateTo, "dd MMM yyyy")}`, 14, 30);

    doc.setFontSize(12);
    doc.text("P&L Summary", 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `Rs. ${totalRevenue.toLocaleString()}`],
        ["Total Refunds", `Rs. ${totalRefunds.toLocaleString()}`],
        ["Total Expenses", `Rs. ${totalExpenses.toLocaleString()}`],
        ["Net Profit", `Rs. ${totalProfit.toLocaleString()}`],
        ["Total Appointments", appointments.length.toString()],
        ["Total Patients", patients.length.toString()],
        ["Doctors", doctors.length.toString()],
      ],
    });

    doc.setFontSize(12);
    doc.text("Doctor Performance", 14, (doc as any).lastAutoTable.finalY + 14);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 18,
      head: [["Doctor", "Specialization", "Appointments", "Revenue", "Clinic Share", "Completion %"]],
      body: doctorScorecard.map(d => [d.full_name, d.specialization, d.totalAppointments.toString(), `Rs. ${d.totalRevenue.toLocaleString()}`, `Rs. ${d.clinicShare.toLocaleString()}`, `${d.completionRate}%`]),
    });

    doc.save(`clinic-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Clinic Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive P&L and performance insights</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateFrom, "dd MMM yyyy")}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={d => d && setDateFrom(d)} /></PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><CalendarIcon className="mr-2 h-4 w-4" />{format(dateTo, "dd MMM yyyy")}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={d => d && setDateTo(d)} /></PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1" /> Export PDF</Button>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold">Rs. {totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Refunds</p>
            <p className="text-lg font-bold text-red-500">Rs. {totalRefunds.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-bold text-orange-500">Rs. {totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={cn("text-lg font-bold", totalProfit >= 0 ? "text-green-600" : "text-red-500")}>Rs. {totalProfit.toLocaleString()}</p>
            <div className={cn("flex items-center gap-1 text-xs mt-1", revenueGrowth >= 0 ? "text-green-600" : "text-red-500")}>
              {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-lg font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{noShowRate}% cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit & Loss Trend</CardTitle>
          <CardDescription>Revenue vs Expenses vs Profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => `Rs. ${val.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.3} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke={COLORS[0]} strokeWidth={2.5} dot={{ r: 4 }} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Doctor Performance Scorecard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Doctor Performance Scorecard</CardTitle>
          <CardDescription>Compare doctor metrics side by side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Doctor</TableHead>
                  <TableHead className="text-xs">Specialization</TableHead>
                  <TableHead className="text-xs text-right">Patients</TableHead>
                  <TableHead className="text-xs text-right">Appointments</TableHead>
                  <TableHead className="text-xs text-right">Revenue</TableHead>
                  <TableHead className="text-xs text-right">Clinic Share</TableHead>
                  <TableHead className="text-xs text-center">Completion</TableHead>
                  <TableHead className="text-xs text-center">Cancel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctorScorecard.map((doc, i) => (
                  <TableRow key={doc.id}>
                    <TableCell className="text-xs font-medium">
                      {i === 0 && <span className="text-yellow-500">🥇</span>}
                      {i === 1 && <span className="text-gray-400">🥈</span>}
                      {i === 2 && <span className="text-amber-600">🥉</span>}
                      {i > 2 && (i + 1)}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{doc.full_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.specialization}</TableCell>
                    <TableCell className="text-xs text-right">{doc.patients}</TableCell>
                    <TableCell className="text-xs text-right">{doc.totalAppointments}</TableCell>
                    <TableCell className="text-xs text-right font-medium">Rs. {doc.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-right">Rs. {Math.round(doc.clinicShare).toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant={Number(doc.completionRate) >= 80 ? "default" : "secondary"} className="text-xs">
                        {doc.completionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant={Number(doc.cancelRate) > 20 ? "destructive" : "secondary"} className="text-xs">
                        {doc.cancelRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {doctorScorecard.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-8">No doctor data available</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Specialization + Expense Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Specialization</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBySpecialization}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val: number) => `Rs. ${val.toLocaleString()}`} />
                  <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Expense Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              {expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => `Rs. ${val.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No expenses recorded</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Demographics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Gender Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Age Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">New vs Returning</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientRetention}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="new" stackId="a" fill={COLORS[0]} name="New" />
                  <Bar dataKey="returning" stackId="a" fill={COLORS[1]} name="Returning" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Status + Heatmap */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Appointment Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {appointmentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {heatmapData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Peak Hours Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="py-1 px-1 text-left font-medium text-muted-foreground">Hr</th>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                        <th key={d} className="py-1 px-1 text-center font-medium text-muted-foreground">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map(row => {
                      const maxVal = Math.max(...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => row[d] || 0), 1);
                      return (
                        <tr key={row.hour}>
                          <td className="py-0.5 px-1 font-medium text-muted-foreground">{row.hour}</td>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => {
                            const val = row[d] || 0;
                            const intensity = val > 0 ? Math.max(0.15, val / maxVal) : 0;
                            return (
                              <td key={d} className="py-0.5 px-1 text-center">
                                <div className="rounded mx-auto flex items-center justify-center h-6 w-8 text-xs font-medium"
                                  style={{
                                    backgroundColor: val > 0 ? `hsl(var(--primary) / ${intensity})` : "hsl(var(--muted))",
                                    color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                                  }}>
                                  {val || "–"}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClinicReports;
