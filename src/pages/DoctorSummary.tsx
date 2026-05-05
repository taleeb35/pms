import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Users, Calendar as CalIcon, CheckCircle2, XCircle, DollarSign, RotateCcw, Clock, UserPlus, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  newPatients: number;
  revenue: number;
  refunds: number;
  net: number;
  consultationFee: number;
  procedureFee: number;
  otherFee: number;
}

const blank: Stats = {
  total: 0, scheduled: 0, inProgress: 0, completed: 0, cancelled: 0,
  newPatients: 0, revenue: 0, refunds: 0, net: 0,
  consultationFee: 0, procedureFee: 0, otherFee: 0,
};

const DoctorSummary = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>(blank);

  useEffect(() => { void load(); }, [date]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const dateStr = format(date, "yyyy-MM-dd");

      const [{ data: appts }, { data: patients }] = await Promise.all([
        supabase
          .from("appointments")
          .select("status, consultation_fee, procedure_fee, other_fee, total_fee, refund")
          .eq("doctor_id", user.id)
          .eq("appointment_date", dateStr),
        supabase
          .from("patients")
          .select("id, created_at")
          .eq("created_by", user.id)
          .gte("created_at", `${dateStr}T00:00:00`)
          .lte("created_at", `${dateStr}T23:59:59.999`),
      ]);

      const a = appts || [];
      const s: Stats = { ...blank };
      s.total = a.length;
      for (const r of a) {
        if (r.status === "scheduled") s.scheduled++;
        else if (r.status === "in_progress") s.inProgress++;
        else if (r.status === "completed") s.completed++;
        else if (r.status === "cancelled") s.cancelled++;
        if (r.status !== "cancelled") {
          s.revenue += Number(r.total_fee) || 0;
          s.consultationFee += Number(r.consultation_fee) || 0;
          s.procedureFee += Number(r.procedure_fee) || 0;
          s.otherFee += Number(r.other_fee) || 0;
        }
        s.refunds += Number(r.refund) || 0;
      }
      s.net = s.revenue - s.refunds;
      s.newPatients = patients?.length || 0;
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  const fmtPKR = (n: number) =>
    `Rs. ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

  const cards: Array<{ label: string; value: string | number; icon: any; tint: string }> = [
    { label: "Total Appointments", value: stats.total, icon: CalIcon, tint: "from-blue-500/10 to-blue-500/5 text-blue-600" },
    { label: "New Patients", value: stats.newPatients, icon: UserPlus, tint: "from-emerald-500/10 to-emerald-500/5 text-emerald-600" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, tint: "from-green-500/10 to-green-500/5 text-green-600" },
    { label: "In Progress", value: stats.inProgress, icon: Activity, tint: "from-amber-500/10 to-amber-500/5 text-amber-600" },
    { label: "Scheduled", value: stats.scheduled, icon: Clock, tint: "from-sky-500/10 to-sky-500/5 text-sky-600" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, tint: "from-rose-500/10 to-rose-500/5 text-rose-600" },
    { label: "Revenue Collected", value: fmtPKR(stats.revenue), icon: DollarSign, tint: "from-violet-500/10 to-violet-500/5 text-violet-600" },
    { label: "Refunded", value: fmtPKR(stats.refunds), icon: RotateCcw, tint: "from-orange-500/10 to-orange-500/5 text-orange-600" },
    { label: "Net Revenue", value: fmtPKR(stats.net), icon: DollarSign, tint: "from-primary/10 to-primary/5 text-primary" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Daily Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick snapshot of your day — appointments, patients and revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDate(new Date())}>Today</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("min-w-[200px] justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "EEE, MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.label} className={cn("border-0 shadow-md bg-gradient-to-br", c.tint.split(" ").slice(0, 2).join(" "))}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{c.label}</p>
                      <p className="text-2xl font-bold mt-1">{c.value}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-xl bg-background flex items-center justify-center", c.tint.split(" ").slice(2).join(" "))}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">Consultation</p>
                <p className="text-lg font-semibold mt-1">{fmtPKR(stats.consultationFee)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">Procedures</p>
                <p className="text-lg font-semibold mt-1">{fmtPKR(stats.procedureFee)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">Other</p>
                <p className="text-lg font-semibold mt-1">{fmtPKR(stats.otherFee)}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DoctorSummary;
