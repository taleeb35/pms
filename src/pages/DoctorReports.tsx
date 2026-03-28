import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, subDays, parseISO, eachDayOfInterval, eachMonthOfInterval, getDay, differenceInDays, subYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Users, UserPlus, UserCheck, Clock, XCircle, Download, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
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

const DoctorReports = () => {
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date>(subMonths(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

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

      const [apptRes, patientRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, consultation_fee, procedure_fee, other_fee, total_fee, refund, appointment_type, patient_id, duration_minutes")
          .eq("doctor_id", user.id)
          .gte("appointment_date", from)
          .lte("appointment_date", to)
          .order("appointment_date"),
        supabase
          .from("patients")
          .select("id, full_name, gender, date_of_birth, city, created_at")
          .eq("created_by", user.id),
      ]);

      setAppointments(apptRes.data || []);
      setPatients(patientRes.data || []);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ======= REVENUE TREND ANALYSIS =======
  const revenueTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthAppts = appointments.filter(a => a.appointment_date?.startsWith(monthStr) && a.status !== "cancelled");
      const revenue = monthAppts.reduce((sum, a) => sum + (Number(a.total_fee) || 0), 0);
      const refunds = monthAppts.reduce((sum, a) => sum + (Number(a.refund) || 0), 0);
      const consultationRev = monthAppts.reduce((sum, a) => sum + (Number(a.consultation_fee) || 0), 0);
      const procedureRev = monthAppts.reduce((sum, a) => sum + (Number(a.procedure_fee) || 0), 0);
      return {
        month: format(month, "MMM yyyy"),
        revenue,
        refunds,
        net: revenue - refunds,
        consultation: consultationRev,
        procedures: procedureRev,
      };
    });
  }, [appointments, dateFrom, dateTo]);

  const revenueGrowth = useMemo(() => {
    if (revenueTrendData.length < 2) return 0;
    const current = revenueTrendData[revenueTrendData.length - 1]?.net || 0;
    const previous = revenueTrendData[revenueTrendData.length - 2]?.net || 1;
    return ((current - previous) / previous * 100);
  }, [revenueTrendData]);

  const totalRevenue = revenueTrendData.reduce((s, d) => s + d.revenue, 0);
  const totalRefunds = revenueTrendData.reduce((s, d) => s + d.refunds, 0);
  const totalNet = totalRevenue - totalRefunds;

  // ======= PATIENT DEMOGRAPHICS =======
  const genderData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      const g = p.gender || "Unknown";
      counts[g] = (counts[g] || 0) + 1;
    });
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

  const cityDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      const city = p.city || "Unknown";
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [patients]);

  // ======= NEW VS RETURNING PATIENTS =======
  const patientRetention = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    const firstVisit: Record<string, string> = {};
    
    // Sort appointments by date
    const sorted = [...appointments].sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
    sorted.forEach(a => {
      if (!firstVisit[a.patient_id]) {
        firstVisit[a.patient_id] = a.appointment_date;
      }
    });

    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthAppts = appointments.filter(a => a.appointment_date?.startsWith(monthStr));
      const uniquePatients = new Set(monthAppts.map(a => a.patient_id));
      let newP = 0, returning = 0;
      uniquePatients.forEach(pid => {
        if (firstVisit[pid]?.startsWith(monthStr)) newP++;
        else returning++;
      });
      return { month: format(month, "MMM yy"), new: newP, returning, total: newP + returning };
    });
  }, [appointments, dateFrom, dateTo]);

  // ======= APPOINTMENT ANALYTICS =======
  const appointmentStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      const status = a.status || "scheduled";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [appointments]);

  const noShowRate = useMemo(() => {
    const total = appointments.length;
    const cancelled = appointments.filter(a => a.status === "cancelled").length;
    return total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0";
  }, [appointments]);

  const completionRate = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === "completed").length;
    return total > 0 ? ((completed / total) * 100).toFixed(1) : "0";
  }, [appointments]);

  // Appointment heatmap: day of week × hour
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hourCounts: Record<string, Record<string, number>> = {};
    
    days.forEach(d => { hourCounts[d] = {}; });
    
    appointments.forEach(a => {
      if (!a.appointment_date || !a.appointment_time) return;
      const dayName = days[getDay(parseISO(a.appointment_date))];
      const hour = a.appointment_time.split(":")[0];
      const hourLabel = `${hour}:00`;
      hourCounts[dayName][hourLabel] = (hourCounts[dayName][hourLabel] || 0) + 1;
    });

    // Get all unique hours
    const allHours = new Set<string>();
    Object.values(hourCounts).forEach(h => Object.keys(h).forEach(k => allHours.add(k)));
    const sortedHours = Array.from(allHours).sort();

    return sortedHours.map(hour => {
      const row: Record<string, any> = { hour };
      days.forEach(d => { row[d] = hourCounts[d][hour] || 0; });
      return row;
    });
  }, [appointments]);

  // Appointment type breakdown
  const appointmentTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach(a => {
      const type = a.appointment_type === "follow_up" ? "Follow-up" : "New";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  // Daily appointment volume
  const dailyVolume = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const count = appointments.filter(a => a.appointment_date?.startsWith(monthStr)).length;
      return { month: format(month, "MMM yy"), appointments: count };
    });
  }, [appointments, dateFrom, dateTo]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Doctor Analytics Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${format(dateFrom, "dd MMM yyyy")} - ${format(dateTo, "dd MMM yyyy")}`, 14, 30);

    doc.setFontSize(12);
    doc.text("Revenue Summary", 14, 42);
    autoTable(doc, {
      startY: 46,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `Rs. ${totalRevenue.toLocaleString()}`],
        ["Total Refunds", `Rs. ${totalRefunds.toLocaleString()}`],
        ["Net Revenue", `Rs. ${totalNet.toLocaleString()}`],
        ["Total Appointments", appointments.length.toString()],
        ["Completion Rate", `${completionRate}%`],
        ["Cancellation Rate", `${noShowRate}%`],
        ["Total Patients", patients.length.toString()],
      ],
    });

    doc.setFontSize(12);
    doc.text("Monthly Revenue", 14, (doc as any).lastAutoTable.finalY + 14);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 18,
      head: [["Month", "Revenue", "Refunds", "Net"]],
      body: revenueTrendData.map(d => [d.month, `Rs. ${d.revenue.toLocaleString()}`, `Rs. ${d.refunds.toLocaleString()}`, `Rs. ${d.net.toLocaleString()}`]),
    });

    doc.save(`doctor-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive insights into your practice</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateFrom, "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={d => d && setDateFrom(d)} /></PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateTo, "dd MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={d => d && setDateTo(d)} /></PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-1" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Net Revenue</p>
            <p className="text-xl font-bold">Rs. {totalNet.toLocaleString()}</p>
            <div className={cn("flex items-center gap-1 text-xs mt-1", revenueGrowth >= 0 ? "text-green-600" : "text-red-500")}>
              {revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(revenueGrowth).toFixed(1)}% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Patients</p>
            <p className="text-xl font-bold">{patients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{genderData.map(g => `${g.name}: ${g.value}`).join(", ")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{appointments.length} total appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Cancellation Rate</p>
            <p className="text-xl font-bold text-red-500">{noShowRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{appointments.filter(a => a.status === "cancelled").length} cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue breakdown: Consultation vs Procedures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => `Rs. ${val.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="consultation" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} name="Consultation" />
                <Area type="monotone" dataKey="procedures" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} name="Procedures" />
                <Line type="monotone" dataKey="net" stroke={COLORS[3]} strokeWidth={2} dot={false} name="Net Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Patient Demographics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Distribution</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">Age Distribution</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle className="text-base">Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[1]} radius={[0, 4, 4, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New vs Returning Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New vs Returning Patients</CardTitle>
          <CardDescription>Patient retention analysis over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patientRetention}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" stackId="a" fill={COLORS[0]} name="New Patients" radius={[0, 0, 0, 0]} />
                <Bar dataKey="returning" stackId="a" fill={COLORS[1]} name="Returning Patients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Analytics */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointment Volume</CardTitle>
            <CardDescription>Monthly appointment trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyVolume}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="appointments" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-56 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={appointmentStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {appointmentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Heatmap */}
      {heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peak Hours Heatmap</CardTitle>
            <CardDescription>Appointment density by day of week and hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="py-1 px-2 text-left font-medium text-muted-foreground">Hour</th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                      <th key={d} className="py-1 px-2 text-center font-medium text-muted-foreground">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map(row => {
                    const maxVal = Math.max(...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => row[d] || 0), 1);
                    return (
                      <tr key={row.hour}>
                        <td className="py-1 px-2 font-medium text-muted-foreground">{row.hour}</td>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => {
                          const val = row[d] || 0;
                          const intensity = val > 0 ? Math.max(0.15, val / maxVal) : 0;
                          return (
                            <td key={d} className="py-1 px-2 text-center">
                              <div
                                className="rounded-md mx-auto flex items-center justify-center h-7 w-10 text-xs font-medium"
                                style={{
                                  backgroundColor: val > 0 ? `hsl(var(--primary) / ${intensity})` : "hsl(var(--muted))",
                                  color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                                }}
                              >
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

      {/* Appointment Type */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New vs Follow-up Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appointmentTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {appointmentTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Avg Revenue/Appointment</span>
              <span className="font-semibold text-sm">Rs. {appointments.length > 0 ? Math.round(totalNet / appointments.length).toLocaleString() : 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Avg Revenue/Patient</span>
              <span className="font-semibold text-sm">Rs. {patients.length > 0 ? Math.round(totalNet / patients.length).toLocaleString() : 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Avg Appointments/Month</span>
              <span className="font-semibold text-sm">{revenueTrendData.length > 0 ? Math.round(appointments.length / revenueTrendData.length) : 0}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total Refunds</span>
              <span className="font-semibold text-sm text-red-500">Rs. {totalRefunds.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorReports;
