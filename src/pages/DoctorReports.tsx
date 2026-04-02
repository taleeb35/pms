import { useState, useEffect, useMemo } from "react";
import { calculatePregnancyWeeks, calculateExpectedDueDate, getTrimester, getTrimesterLabel } from "@/lib/pregnancyUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, subDays, parseISO, eachDayOfInterval, eachMonthOfInterval, getDay, differenceInDays, subYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, TrendingUp, TrendingDown, Users, UserPlus, UserCheck, Clock, XCircle, Download, BarChart3, Zap, AlertTriangle, Activity, Stethoscope, ShieldAlert, Baby, Heart } from "lucide-react";
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
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [icdCodes, setIcdCodes] = useState<any[]>([]);
  const [isGynecologist, setIsGynecologist] = useState(false);

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

      const [apptRes, patientRes, allApptRes, medRecRes, icdRes, doctorRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, consultation_fee, procedure_fee, other_fee, total_fee, refund, appointment_type, patient_id, duration_minutes, started_at, completed_at, icd_code_id")
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
          .eq("doctor_id", user.id)
          .order("appointment_date"),
        supabase
          .from("medical_records")
          .select("id, diagnosis, patient_id, visit_date")
          .eq("doctor_id", user.id)
          .order("visit_date", { ascending: false }),
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

  // ======= GROWTH METRICS =======
  const growthMetrics = useMemo(() => {
    const completedAppts = appointments.filter(a => a.status !== "cancelled");
    const uniquePatients = new Set(completedAppts.map(a => a.patient_id)).size;
    const revenuePerPatient = uniquePatients > 0 ? totalNet / uniquePatients : 0;
    const workingDays = new Set(completedAppts.map(a => a.appointment_date)).size;
    const dailyAvgRevenue = workingDays > 0 ? totalNet / workingDays : 0;
    const uniqueHours = new Set<string>();
    completedAppts.forEach(a => {
      if (a.appointment_date && a.appointment_time) uniqueHours.add(`${a.appointment_date}_${a.appointment_time.split(":")[0]}`);
    });
    const revenuePerHour = uniqueHours.size > 0 ? totalNet / uniqueHours.size : 0;
    const momGrowth = revenueTrendData.length >= 2 ? (() => {
      const curr = revenueTrendData[revenueTrendData.length - 1]?.net || 0;
      const prev = revenueTrendData[revenueTrendData.length - 2]?.net || 0;
      return prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
    })() : 0;
    const yoyGrowth = revenueTrendData.length >= 4 ? (() => {
      const half = Math.floor(revenueTrendData.length / 2);
      const firstHalf = revenueTrendData.slice(0, half).reduce((s, d) => s + (d.net || 0), 0);
      const secondHalf = revenueTrendData.slice(half).reduce((s, d) => s + (d.net || 0), 0);
      return firstHalf !== 0 ? ((secondHalf - firstHalf) / Math.abs(firstHalf)) * 100 : 0;
    })() : 0;
    return { revenuePerPatient, revenuePerHour, dailyAvgRevenue, momGrowth, yoyGrowth };
  }, [appointments, totalNet, revenueTrendData]);

  // ======= AVERAGE CONSULTATION TIME =======
  const consultationTimeData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    return months.map(month => {
      const monthStr = format(month, "yyyy-MM");
      const monthAppts = appointments.filter(a => 
        a.appointment_date?.startsWith(monthStr) && 
        a.started_at && a.completed_at && a.status === "completed"
      );
      const durations = monthAppts.map(a => {
        const start = new Date(a.started_at).getTime();
        const end = new Date(a.completed_at).getTime();
        return Math.max(0, (end - start) / 60000); // minutes
      }).filter(d => d > 0 && d < 300); // filter unrealistic values
      const avg = durations.length > 0 ? parseFloat((durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1)) : 0;
      const min = durations.length > 0 ? parseFloat(Math.min(...durations).toFixed(1)) : 0;
      const max = durations.length > 0 ? parseFloat(Math.max(...durations).toFixed(1)) : 0;
      return { month: format(month, "MMM yyyy"), avg, min, max, count: durations.length };
    });
  }, [appointments, dateFrom, dateTo]);

  const overallAvgTime = useMemo(() => {
    const allDurations = appointments
      .filter(a => a.started_at && a.completed_at && a.status === "completed")
      .map(a => {
        const start = new Date(a.started_at).getTime();
        const end = new Date(a.completed_at).getTime();
        return Math.max(0, (end - start) / 60000);
      })
      .filter(d => d > 0 && d < 300);
    return allDurations.length > 0 ? parseFloat((allDurations.reduce((s, d) => s + d, 0) / allDurations.length).toFixed(1)) : 0;
  }, [appointments]);

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

  // ======= 1. PATIENT VISIT FREQUENCY =======
  const visitFrequencyData = useMemo(() => {
    const patientVisitMap: Record<string, { name: string; visits: number }> = {};
    const completedAppts = allAppointments.filter(a => a.status === "completed" || a.status === "scheduled" || a.status === "start");
    completedAppts.forEach(a => {
      if (!patientVisitMap[a.patient_id]) {
        const patient = patients.find(p => p.id === a.patient_id);
        patientVisitMap[a.patient_id] = { name: patient?.full_name || "Unknown", visits: 0 };
      }
      patientVisitMap[a.patient_id].visits++;
    });
    const allVisits = Object.values(patientVisitMap);
    const avgVisits = allVisits.length > 0 ? parseFloat((allVisits.reduce((s, p) => s + p.visits, 0) / allVisits.length).toFixed(1)) : 0;
    const topRecurring = allVisits.sort((a, b) => b.visits - a.visits).slice(0, 10);
    const distribution: Record<string, number> = { "1 visit": 0, "2-3 visits": 0, "4-5 visits": 0, "6-10 visits": 0, "10+ visits": 0 };
    allVisits.forEach(p => {
      if (p.visits === 1) distribution["1 visit"]++;
      else if (p.visits <= 3) distribution["2-3 visits"]++;
      else if (p.visits <= 5) distribution["4-5 visits"]++;
      else if (p.visits <= 10) distribution["6-10 visits"]++;
      else distribution["10+ visits"]++;
    });
    const distributionData = Object.entries(distribution).map(([range, count]) => ({ range, count }));
    return { avgVisits, topRecurring, distributionData, totalPatients: allVisits.length };
  }, [allAppointments, patients]);

  // ======= 2. PATIENT DROP-OFF ANALYSIS =======
  const dropOffData = useMemo(() => {
    const today = new Date();
    const patientLastVisit: Record<string, { name: string; lastDate: string; daysSince: number }> = {};
    const completedAppts = allAppointments.filter(a => a.status === "completed");
    completedAppts.forEach(a => {
      const patient = patients.find(p => p.id === a.patient_id);
      if (!patientLastVisit[a.patient_id] || a.appointment_date > patientLastVisit[a.patient_id].lastDate) {
        patientLastVisit[a.patient_id] = {
          name: patient?.full_name || "Unknown",
          lastDate: a.appointment_date,
          daysSince: differenceInDays(today, parseISO(a.appointment_date)),
        };
      }
    });
    const allPatientData = Object.values(patientLastVisit);
    const over30 = allPatientData.filter(p => p.daysSince >= 30 && p.daysSince < 60).sort((a, b) => b.daysSince - a.daysSince);
    const over60 = allPatientData.filter(p => p.daysSince >= 60 && p.daysSince < 90).sort((a, b) => b.daysSince - a.daysSince);
    const over90 = allPatientData.filter(p => p.daysSince >= 90).sort((a, b) => b.daysSince - a.daysSince);
    const summaryData = [
      { range: "30-60 days", count: over30.length, color: "hsl(var(--chart-3, 30 80% 55%))" },
      { range: "60-90 days", count: over60.length, color: "hsl(var(--chart-5, 340 75% 55%))" },
      { range: "90+ days", count: over90.length, color: "hsl(var(--destructive))" },
    ];
    return { over30, over60, over90, summaryData, total: over30.length + over60.length + over90.length };
  }, [allAppointments, patients]);

  // ======= 3. TOP DISEASES / DIAGNOSES =======
  const topDiseasesData = useMemo(() => {
    const diseaseCounts: Record<string, number> = {};
    // From ICD codes in appointments
    appointments.forEach(a => {
      if (a.icd_code_id) {
        const icd = icdCodes.find(c => c.id === a.icd_code_id);
        if (icd) {
          const label = `${icd.code} - ${icd.description}`;
          diseaseCounts[label] = (diseaseCounts[label] || 0) + 1;
        }
      }
    });
    // From medical records diagnosis
    medicalRecords.forEach(r => {
      if (r.diagnosis) {
        const diagnosisText = r.diagnosis.trim();
        if (diagnosisText) {
          diseaseCounts[diagnosisText] = (diseaseCounts[diagnosisText] || 0) + 1;
        }
      }
    });
    return Object.entries(diseaseCounts)
      .map(([name, count]) => ({ name: name.length > 40 ? name.substring(0, 37) + "..." : name, fullName: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [appointments, icdCodes, medicalRecords]);

  // ======= 4. ALLERGY DISTRIBUTION =======
  const allergyData = useMemo(() => {
    const allergyCounts: Record<string, number> = {};
    patients.forEach(p => {
      if (p.allergies) {
        const parts = p.allergies.split(/[,;]+/).map((a: string) => a.trim().toLowerCase()).filter(Boolean);
        parts.forEach((allergy: string) => {
          const normalized = allergy.charAt(0).toUpperCase() + allergy.slice(1);
          allergyCounts[normalized] = (allergyCounts[normalized] || 0) + 1;
        });
      }
    });
    return Object.entries(allergyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [patients]);

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

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Growth Metrics
          </CardTitle>
          <CardDescription>Key performance indicators for practice growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Revenue / Patient</p>
              <p className="text-lg font-bold">Rs. {Math.round(growthMetrics.revenuePerPatient).toLocaleString()}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Revenue / Working Hour</p>
              <p className="text-lg font-bold">Rs. {Math.round(growthMetrics.revenuePerHour).toLocaleString()}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Daily Avg Revenue</p>
              <p className="text-lg font-bold">Rs. {Math.round(growthMetrics.dailyAvgRevenue).toLocaleString()}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Month-over-Month</p>
              <p className={cn("text-lg font-bold", growthMetrics.momGrowth >= 0 ? "text-green-600" : "text-destructive")}>
                {growthMetrics.momGrowth >= 0 ? "+" : ""}{growthMetrics.momGrowth.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Period Growth</p>
              <p className={cn("text-lg font-bold", growthMetrics.yoyGrowth >= 0 ? "text-green-600" : "text-destructive")}>
                {growthMetrics.yoyGrowth >= 0 ? "+" : ""}{growthMetrics.yoyGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peak Hours Heatmap</CardTitle>
          <CardDescription>Appointment density by day of week and hour</CardDescription>
        </CardHeader>
        <CardContent>
          {heatmapData.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No appointment data for heatmap in selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Average Consultation Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Average Consultation Time
              </CardTitle>
              <CardDescription>Time patients spend with you per appointment</CardDescription>
            </div>
            {overallAvgTime > 0 && (
              <div className="text-right">
                <p className="text-3xl font-bold">{overallAvgTime} min</p>
                <p className="text-xs text-muted-foreground">Overall Average</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {consultationTimeData.every(d => d.count === 0) ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No consultation time data yet</p>
              <p className="text-sm mt-1">Time tracking starts when you mark an appointment as "Started" and then "Completed"</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consultationTimeData.filter(d => d.count > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Minutes", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))" } }} />
                    <Tooltip 
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number, name: string) => [`${value} min`, name === "avg" ? "Average" : name === "min" ? "Shortest" : "Longest"]}
                    />
                    <Legend formatter={(value) => value === "avg" ? "Average" : value === "min" ? "Shortest" : "Longest"} />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="avg" />
                    <Bar dataKey="min" fill="hsl(var(--chart-2, 160 60% 45%))" radius={[4, 4, 0, 0]} name="min" />
                    <Bar dataKey="max" fill="hsl(var(--chart-3, 30 80% 55%))" radius={[4, 4, 0, 0]} name="max" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {consultationTimeData.filter(d => d.count > 0).slice(-4).map((d) => (
                  <div key={d.month} className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">{d.month}</p>
                    <p className="text-lg font-bold">{d.avg} min</p>
                    <p className="text-xs text-muted-foreground">{d.count} appointments</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======= PATIENT VISIT FREQUENCY ======= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Patient Visit Frequency
          </CardTitle>
          <CardDescription>Average visits per patient and top recurring patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{visitFrequencyData.avgVisits}</p>
                  <p className="text-xs text-muted-foreground">Avg Visits/Patient</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{visitFrequencyData.totalPatients}</p>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </div>
              </div>
              <p className="text-sm font-medium mb-2">Visit Distribution</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitFrequencyData.distributionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Top Recurring Patients</p>
              {visitFrequencyData.topRecurring.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {visitFrequencyData.topRecurring.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                        <span className="text-sm font-medium truncate max-w-[180px]">{p.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{p.visits} visits</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No patient data available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======= PATIENT DROP-OFF ANALYSIS ======= */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Patient Drop-off Analysis
              </CardTitle>
              <CardDescription>Patients who haven't returned in 30/60/90+ days</CardDescription>
            </div>
            {dropOffData.total > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-destructive">{dropOffData.total}</p>
                <p className="text-xs text-muted-foreground">Inactive Patients</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropOffData.summaryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="range" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" name="Patients" radius={[0, 4, 4, 0]}>
                    {dropOffData.summaryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">90+ Days Inactive (Needs Attention)</p>
              {dropOffData.over90.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dropOffData.over90.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                      <span className="text-sm font-medium truncate max-w-[180px]">{p.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-destructive">{p.daysSince}d ago</span>
                        <p className="text-xs text-muted-foreground">{format(parseISO(p.lastDate), "dd MMM yyyy")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No patients inactive for 90+ days</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======= TOP DISEASES / DIAGNOSES ======= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Top Diseases & Diagnoses
          </CardTitle>
          <CardDescription>Most common conditions treated (from ICD codes & medical records)</CardDescription>
        </CardHeader>
        <CardContent>
          {topDiseasesData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDiseasesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={150} />
                    <Tooltip formatter={(val: number, _: string, props: any) => [val, props.payload.fullName || "Cases"]} />
                    <Bar dataKey="count" name="Cases" radius={[0, 4, 4, 0]}>
                      {topDiseasesData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Breakdown</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {topDiseasesData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm truncate max-w-[200px]" title={d.fullName}>{d.fullName}</span>
                      </div>
                      <span className="text-sm font-bold">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No diagnosis data available yet</p>
              <p className="text-xs mt-1">Add ICD codes to appointments or diagnoses to medical records</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======= ALLERGY DISTRIBUTION ======= */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" /> Allergy Distribution
          </CardTitle>
          <CardDescription>Most common allergies across your patient base</CardDescription>
        </CardHeader>
        <CardContent>
          {allergyData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allergyData.slice(0, 8)} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="count" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {allergyData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">All Allergies ({allergyData.length})</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {allergyData.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm">{a.name}</span>
                      </div>
                      <span className="text-sm font-bold">{a.count} patients</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No allergy data recorded</p>
              <p className="text-xs mt-1">Add allergies to patient profiles to see distribution</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReports;
