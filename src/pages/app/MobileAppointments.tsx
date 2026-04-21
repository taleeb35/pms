import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { Calendar, Clock, Search } from "lucide-react";

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "no_show";
type DateFilter = "all" | "today" | "7" | "30";

const MobileAppointments = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, patients(full_name, phone)")
        .eq("doctor_id", user.id)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(200);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return items.filter((a) => {
      if (status !== "all" && (a.status || "scheduled") !== status) return false;

      if (dateRange !== "all") {
        const d = new Date(a.appointment_date);
        if (dateRange === "today") {
          if (format(d, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) return false;
        } else {
          const days = parseInt(dateRange);
          if (!isAfter(d, subDays(today, days))) return false;
        }
      }

      if (q) {
        const s = q.toLowerCase();
        const name = (a.patients?.full_name || "").toLowerCase();
        const phone = (a.patients?.phone || "").toLowerCase();
        const reason = (a.reason || "").toLowerCase();
        if (!name.includes(s) && !phone.includes(s) && !reason.includes(s)) return false;
      }
      return true;
    });
  }, [items, status, dateRange, q]);

  const statusColor = (s: string) => {
    switch (s) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      case "no_show": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-info/10 text-info border-info/20";
    }
  };

  return (
    <MobileAppShell title="Appointments">
      {/* Filters */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient, phone, reason"
            className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-0 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No show</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateFilter)}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/50 border-0 text-sm">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-[11px] text-muted-foreground px-1">
          Showing {filtered.length} of {items.length}
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12">No appointments match</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card key={a.id} className="p-3 border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{a.patients?.full_name || "Unknown"}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(a.appointment_date), "dd MMM")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.appointment_time}</span>
                  </div>
                  {a.reason && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.reason}</p>}
                </div>
                <Badge className={`capitalize text-[10px] border ${statusColor(a.status || "scheduled")}`} variant="outline">
                  {(a.status || "scheduled").replace("_", " ")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MobileAppShell>
  );
};

export default MobileAppointments;
