import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileAppShell from "@/components/MobileAppShell";
import MobileFAB from "@/components/mobile/MobileFAB";
import MobileEmptyState from "@/components/mobile/MobileEmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { Calendar, Clock, Search, SlidersHorizontal, X, Phone, ChevronRight, CalendarDays } from "lucide-react";
import { useMobileRole } from "@/hooks/useMobileRole";

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled" | "no_show";
type DateFilter = "all" | "today" | "7" | "30" | "upcoming";

const STATUS_CHOICES: { v: StatusFilter; label: string }[] = [
  { v: "all", label: "All" },
  { v: "scheduled", label: "Scheduled" },
  { v: "completed", label: "Completed" },
  { v: "cancelled", label: "Cancelled" },
  { v: "no_show", label: "No show" },
];

const DATE_CHOICES: { v: DateFilter; label: string }[] = [
  { v: "all", label: "All dates" },
  { v: "today", label: "Today" },
  { v: "upcoming", label: "Upcoming" },
  { v: "7", label: "Last 7 days" },
  { v: "30", label: "Last 30 days" },
];

const MobileAppointments = () => {
  const navigate = useNavigate();
  const { id: userId, role } = useMobileRole();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!userId || !role) return;
    const load = async () => {
      setLoading(true);
      const base = supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, reason, doctor_id, patients(full_name, phone, patient_id)")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(300);

      let query = base;
      if (role === "doctor") {
        query = query.eq("doctor_id", userId);
      } else {
        const { data: docs } = await supabase
          .from("doctors")
          .select("id")
          .eq("clinic_id", userId);
        const ids = docs?.map((d) => d.id) || [];
        if (ids.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        query = query.in("doctor_id", ids);
      }
      const { data } = await query;
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, [userId, role]);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    return items.filter((a) => {
      if (status !== "all" && (a.status || "scheduled") !== status) return false;

      if (dateRange !== "all") {
        const d = new Date(a.appointment_date);
        if (dateRange === "today") {
          if (format(d, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) return false;
        } else if (dateRange === "upcoming") {
          if (!isAfter(d, subDays(today, 1))) return false;
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

  const activeCount = (status !== "all" ? 1 : 0) + (dateRange !== "all" ? 1 : 0);
  const detailBase = role === "clinic" ? "/clinic/appointments" : "/doctor/appointments";

  return (
    <MobileAppShell title="Appointments">
      <div className="space-y-2 mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search patient, phone, reason"
              className="pl-9 h-11 rounded-xl bg-muted/50 border-0"
            />
          </div>
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl relative shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter appointments</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {STATUS_CHOICES.map((c) => (
                      <button
                        key={c.v}
                        onClick={() => setStatus(c.v)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          status === c.v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-foreground"
                        }`}
                      >{c.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Date</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DATE_CHOICES.map((c) => (
                      <button
                        key={c.v}
                        onClick={() => setDateRange(c.v)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          dateRange === c.v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-foreground"
                        }`}
                      >{c.label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setStatus("all"); setDateRange("all"); }}>Reset</Button>
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>Show {filtered.length}</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {status !== "all" && (
            <button
              onClick={() => setStatus("all")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
            >Status: {status.replace("_", " ")} <X className="h-3 w-3" /></button>
          )}
          {dateRange !== "all" && (
            <button
              onClick={() => setDateRange("all")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
            >Date: {DATE_CHOICES.find((d) => d.v === dateRange)?.label} <X className="h-3 w-3" /></button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground px-1">
          Showing {filtered.length} of {items.length}
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <MobileEmptyState
          icon={CalendarDays}
          title={items.length === 0 ? "No appointments yet" : "No appointments match"}
          description={items.length === 0 ? "Tap + to register a walk-in or schedule a new appointment." : "Try adjusting your filters."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <Card
              key={a.id}
              onClick={() => navigate(`${detailBase}/${a.id}`)}
              className="p-3 border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{a.patients?.full_name || "Unknown patient"}</div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(a.appointment_date), "dd MMM")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.appointment_time?.slice(0,5)}</span>
                    {a.patients?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{a.patients.phone}</span>}
                  </div>
                  {a.reason && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{a.reason}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge className={`capitalize text-[10px] border ${statusColor(a.status || "scheduled")}`} variant="outline">
                    {(a.status || "scheduled").replace("_", " ")}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MobileFAB onClick={() => navigate("/app/walk-in")} ariaLabel="New appointment" />
    </MobileAppShell>
  );
};

export default MobileAppointments;
