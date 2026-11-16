import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Play, CheckCircle2, UserX, Clock, RefreshCw, CalendarPlus, UserPlus, Footprints, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { zonedNow } from "@/lib/region";
import { friendlyTime } from "@/lib/datetime";
import { telLink, whatsappLink } from "@/lib/phoneLinks";
import { withDrTitle } from "@/lib/doctorName";
import { logActivity } from "@/lib/activityLogger";

// "Today" board: today's appointments as Upcoming / With doctor / Done / Missed,
// with one-tap Start, Complete visit, No-show, Call and WhatsApp. Refreshes every 30 s.
type Role = "doctor" | "clinic" | "receptionist";
type Appt = {
  id: string; appointment_time: string | null; status: string; appointment_type: string | null; reason: string | null;
  doctor_id: string; patients: { id: string; full_name: string; phone: string | null } | null;
  doctors?: { profiles?: { full_name?: string | null } | null } | null;
};

const COLUMNS: { key: string; title: string; statuses: string[]; tone: string }[] = [
  { key: "upcoming", title: "Upcoming", statuses: ["scheduled"], tone: "border-t-blue-500" },
  { key: "with", title: "With doctor", statuses: ["start"], tone: "border-t-amber-500" },
  { key: "done", title: "Done", statuses: ["completed"], tone: "border-t-emerald-500" },
  { key: "missed", title: "Missed / cancelled", statuses: ["no_show", "cancelled"], tone: "border-t-gray-400" },
];

export const TodayBoard = ({ role, doctorIds }: { role: Role; doctorIds?: string[] }) => {
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const base = role === "doctor" ? "/doctor" : role === "clinic" ? "/clinic" : "/receptionist";

  const load = useCallback(async () => {
    const { ymd } = zonedNow();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let q = supabase.from("appointments")
      .select("id, appointment_time, status, appointment_type, reason, doctor_id, patients(id, full_name, phone), doctors(profiles(full_name))")
      .eq("appointment_date", ymd)
      .order("appointment_time", { ascending: true });
    if (role === "doctor") q = q.eq("doctor_id", user.id);
    else if (doctorIds && doctorIds.length) q = q.in("doctor_id", doctorIds);
    const { data } = await q;
    setAppts((data as any) || []);
    setLoading(false);
  }, [role, doctorIds]);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const doctors = useMemo(() => {
    const m = new Map<string, string>();
    appts.forEach((a) => m.set(a.doctor_id, withDrTitle(a.doctors?.profiles?.full_name) || "Doctor"));
    return [...m.entries()];
  }, [appts]);
  const shown = doctorFilter === "all" ? appts : appts.filter((a) => a.doctor_id === doctorFilter);

  const setStatus = async (a: Appt, status: string) => {
    setBusy(a.id);
    const patch: Record<string, unknown> = { status };
    if (status === "start") patch.started_at = new Date().toISOString();
    const { error } = await supabase.from("appointments").update(patch as any).eq("id", a.id);
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    try { await logActivity({ action: status === "start" ? "appointment_started" : status === "no_show" ? "appointment_no_show" : "appointment_updated", entityType: "appointment", entityId: a.id, details: { patient_name: a.patients?.full_name, status } } as any); } catch { /* logging is best effort */ }
    toast({ title: status === "start" ? `${a.patients?.full_name} is with the doctor` : status === "no_show" ? "Marked as no-show" : "Updated" });
    load();
  };

  const kpis = [
    { label: "Today", value: shown.length, to: `${base}/appointments` },
    { label: "Still to come", value: shown.filter((a) => a.status === "scheduled").length, to: `${base}/appointments` },
    { label: "Seen", value: shown.filter((a) => a.status === "completed").length, to: `${base}/appointments` },
    { label: "Missed", value: shown.filter((a) => a.status === "no_show" || a.status === "cancelled").length, to: `${base}/appointments?status=no_show` },
  ];

  return (
    <Card className="border-border/40">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5 text-primary" /> Today</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate(`${base}/appointments`)}><CalendarPlus className="mr-1 h-4 w-4" /> New appointment</Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`${base}/walk-in`)}><Footprints className="mr-1 h-4 w-4" /> Walk-in</Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`${base}/patients`)}><UserPlus className="mr-1 h-4 w-4" /> Add patient</Button>
            <Button size="icon" variant="ghost" aria-label="Refresh" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kpis.map((k) => (
            <Link key={k.label} to={k.to} className="rounded-lg border bg-muted/30 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <p className="text-2xl font-bold tabular-nums">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </Link>
          ))}
        </div>
        {doctors.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by doctor">
            <Button size="sm" variant={doctorFilter === "all" ? "default" : "outline"} onClick={() => setDoctorFilter("all")}>All doctors</Button>
            {doctors.map(([id, name]) => (
              <Button key={id} size="sm" variant={doctorFilter === id ? "default" : "outline"} onClick={() => setDoctorFilter(id)}>{name}</Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-4">{COLUMNS.map((c) => <div key={c.key} className="h-32 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : shown.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">No appointments today</p>
            <p className="mt-1 text-sm text-muted-foreground">Book one, or register a walk-in patient when they arrive.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" onClick={() => navigate(`${base}/appointments`)}>Book appointment</Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`${base}/walk-in`)}>Add walk-in</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => {
              const list = shown.filter((a) => col.statuses.includes(a.status));
              return (
                <div key={col.key} className={`min-w-0 rounded-lg border border-t-4 bg-muted/20 p-2 ${col.tone}`}>
                  <p className="mb-2 flex items-center justify-between px-1 text-sm font-semibold">{col.title}<Badge variant="secondary">{list.length}</Badge></p>
                  <div className="space-y-2">
                    {list.length === 0 && <p className="px-1 py-3 text-center text-xs text-muted-foreground">None</p>}
                    {list.map((a) => {
                      const tel = telLink(a.patients?.phone); const wa = whatsappLink(a.patients?.phone);
                      return (
                        <div key={a.id} className="rounded-md border bg-background p-2.5 shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <button className="min-w-0 text-left" onClick={() => navigate(role === "doctor" || role === "clinic" || role === "receptionist" ? `${base}/appointments/${a.id}` : `${base}/appointments`)}>
                              <p className="truncate text-sm font-medium hover:underline">{a.patients?.full_name || "Patient"}</p>
                              <p className="text-xs text-muted-foreground">{friendlyTime(a.appointment_time)}{role !== "doctor" && a.doctors?.profiles?.full_name ? ` · ${withDrTitle(a.doctors.profiles.full_name)}` : ""}</p>
                            </button>
                            <div className="flex shrink-0 gap-1">
                              {tel && <a href={tel} aria-label={`Call ${a.patients?.full_name}`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Phone className="h-4 w-4" /></a>}
                              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${a.patients?.full_name}`} className="rounded p-1 text-emerald-600 hover:bg-emerald-50"><MessageCircle className="h-4 w-4" /></a>}
                            </div>
                          </div>
                          {(a.status === "scheduled" || a.status === "start") && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {a.status === "scheduled" && <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={busy === a.id} onClick={() => setStatus(a, "start")}><Play className="mr-1 h-3 w-3" /> Start</Button>}
                              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`${base}/appointments/${a.id}`)}><CheckCircle2 className="mr-1 h-3 w-3" /> Complete visit</Button>
                              {a.status === "scheduled" && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" disabled={busy === a.id} onClick={() => setStatus(a, "no_show")}><UserX className="mr-1 h-3 w-3" /> No-show</Button>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-3 text-right">
          <Link to={`${base}/appointments`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">All appointments <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayBoard;
