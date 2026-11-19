import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, format } from "date-fns";
import { BellRing, CheckCircle2, Loader2, MessageCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useCareDoctors } from "@/hooks/useCareDoctors";
import AutoEmailReminderToggle from "@/components/AutoEmailReminderToggle";
import { whatsappLink } from "@/lib/phoneLinks";
import { friendlyDate, friendlyTime } from "@/lib/datetime";
import { zonedNow } from "@/lib/region";
import { dueFollowUps, followUpText, needsReminder, reminderText, type DueVisit, type ReminderAppt } from "@/lib/reminders";

// D1 + D8: the front desk's daily list. Tomorrow's appointments to remind, and follow-ups that are due
// but not booked yet. One tap opens WhatsApp with the message filled in and ticks the patient off.
const longDay = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
};

export default function Reminders() {
  useSEO({ title: "Reminders | Zonoir", description: "Appointment reminders and follow-ups" });
  const { toast } = useToast();
  const { base, doctors, loading: docsLoading } = useCareDoctors();
  const today = zonedNow().ymd;
  const [day, setDay] = useState(format(addDays(new Date(`${today}T12:00:00`), 1), "yyyy-MM-dd"));
  const [appts, setAppts] = useState<ReminderAppt[]>([]);
  const [visits, setVisits] = useState<(DueVisit & { patient?: { full_name?: string | null; phone?: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const ids = useMemo(() => doctors.map((d) => d.id), [doctors]);
  const docName = (id: string) => doctors.find((d) => d.id === id)?.name || "";
  const detailBase = base === "/doctor-receptionist" ? null : base;

  const load = useCallback(async () => {
    if (!ids.length) { setLoading(false); return; }
    setLoading(true);
    const [ap, vr] = await Promise.all([
      (supabase as any).from("appointments")
        .select("id, appointment_date, appointment_time, status, doctor_id, reminder_sent_at, source, lead_status, patients(id, full_name, phone)")
        .in("doctor_id", ids).eq("appointment_date", day).order("appointment_time").limit(500),
      (supabase as any).from("visit_records")
        .select("id, patient_id, doctor_id, appointment_id, visit_date, next_visit_date, next_visit_notes, recall_sent_at, patients(full_name, phone)")
        .in("doctor_id", ids).not("next_visit_date", "is", null)
        .gte("next_visit_date", format(addDays(new Date(`${today}T12:00:00`), -30), "yyyy-MM-dd"))
        .lte("next_visit_date", format(addDays(new Date(`${today}T12:00:00`), 7), "yyyy-MM-dd"))
        .order("next_visit_date").limit(500),
    ]);
    const vs = ((vr.data || []) as any[]).map((v) => ({ ...v, patient: v.patients }));
    let later: any[] = [];
    const pids = [...new Set(vs.map((v) => v.patient_id))];
    if (pids.length) {
      const minDate = vs.reduce((m, v) => (v.visit_date < m ? v.visit_date : m), vs[0].visit_date).slice(0, 10);
      const { data } = await supabase.from("appointments").select("id, patient_id, doctor_id, appointment_date, status")
        .in("patient_id", pids.slice(0, 300)).in("doctor_id", ids).gt("appointment_date", minDate).limit(2000);
      later = data || [];
    }
    setAppts(((ap.data || []) as ReminderAppt[]).filter(needsReminder));
    setVisits(dueFollowUps(vs, later) as any);
    setLoading(false);
  }, [ids, day, today]);

  useEffect(() => { if (!docsLoading) void load(); }, [docsLoading, load]);

  const mark = async (table: "appointments" | "visit_records", id: string, sent: boolean) => {
    const col = table === "appointments" ? "reminder_sent_at" : "recall_sent_at";
    const value = sent ? new Date().toISOString() : null;
    const { error } = await (supabase as any).from(table).update({ [col]: value }).eq("id", id);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return; }
    if (table === "appointments") setAppts((l) => l.map((a) => (a.id === id ? { ...a, reminder_sent_at: value } : a)));
    else setVisits((l) => l.map((v) => (v.id === id ? { ...v, recall_sent_at: value } : v)));
  };

  const send = (phone: string | null | undefined, text: string, onSent: () => void) => {
    const wa = whatsappLink(phone, text);
    if (!wa) { toast({ title: "No valid phone number", description: "Add the patient's mobile number first.", variant: "destructive" }); return; }
    window.open(wa, "_blank", "noopener,noreferrer");
    onSent();
  };

  const remindLeft = appts.filter((a) => !a.reminder_sent_at).length;
  const followLeft = visits.filter((v) => !v.recall_sent_at).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><BellRing className="h-6 w-6 text-primary" /> Reminders</h1>
        <p className="text-sm text-muted-foreground">Send appointment reminders and follow-up messages on WhatsApp in one tap. Each patient is ticked off once sent.</p>
      </div>

      <AutoEmailReminderToggle />

      <Tabs defaultValue="reminders">
        <TabsList>
          <TabsTrigger value="reminders">Appointment reminders {remindLeft > 0 && <Badge className="ml-2 h-5 px-1.5">{remindLeft}</Badge>}</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups due {followLeft > 0 && <Badge className="ml-2 h-5 px-1.5">{followLeft}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
              <CardTitle className="text-base">Appointments on {friendlyDate(day)}</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={day === today ? "default" : "outline"} onClick={() => setDay(today)}>Today</Button>
                <Button size="sm" variant={day === format(addDays(new Date(`${today}T12:00:00`), 1), "yyyy-MM-dd") ? "default" : "outline"} onClick={() => setDay(format(addDays(new Date(`${today}T12:00:00`), 1), "yyyy-MM-dd"))}>Tomorrow</Button>
                <Input type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} className="h-9 w-40" aria-label="Date" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <div className="flex items-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
                : appts.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No booked appointments on this day.</p> : (
                <ul className="divide-y">
                  {appts.map((a) => {
                    const text = reminderText({ patient: a.patients?.full_name, doctor: docName(a.doctor_id), day: longDay(a.appointment_date), time: a.appointment_time ? friendlyTime(a.appointment_time) : null });
                    return (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {detailBase ? <Link to={`${detailBase}/appointments/${a.id}`} className="hover:underline">{a.patients?.full_name || "Patient"}</Link> : a.patients?.full_name || "Patient"}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">{a.appointment_time ? friendlyTime(a.appointment_time) : ""}{doctors.length > 1 ? ` · ${docName(a.doctor_id)}` : ""}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{a.patients?.phone || "No phone number"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {a.reminder_sent_at ? (
                            <>
                              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Sent {friendlyTime(format(new Date(a.reminder_sent_at), "HH:mm:ss"))}</span>
                              <Button size="sm" variant="ghost" className="h-8 px-2" title="Mark as not sent" onClick={() => mark("appointments", a.id, false)}><RotateCcw className="h-3.5 w-3.5" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" onClick={() => send(a.patients?.phone, text, () => mark("appointments", a.id, true))}>
                                <MessageCircle className="mr-1.5 h-4 w-4" /> Send reminder
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => mark("appointments", a.id, true)}>Mark sent</Button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Follow-ups due and not booked</CardTitle>
              <p className="text-xs text-muted-foreground">From the "Next visit" date on past visits: overdue up to 30 days, or due in the next 7 days, where the patient has no later appointment.</p>
            </CardHeader>
            <CardContent>
              {loading ? <div className="flex items-center gap-2 py-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
                : visits.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No follow-ups waiting to be booked.</p> : (
                <ul className="divide-y">
                  {visits.map((v) => {
                    const overdue = v.next_visit_date < today;
                    const text = followUpText({ patient: v.patient?.full_name, doctor: docName(v.doctor_id), day: longDay(v.next_visit_date) });
                    return (
                      <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {detailBase ? <Link to={`${detailBase}/patients/${v.patient_id}`} className="hover:underline">{v.patient?.full_name || "Patient"}</Link> : v.patient?.full_name || "Patient"}
                            <Badge variant="outline" className={`ml-2 ${overdue ? "border-rose-300 text-rose-700 dark:text-rose-400" : ""}`}>{overdue ? "Overdue" : "Due"} {friendlyDate(v.next_visit_date)}</Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">{v.patient?.phone || "No phone number"}{doctors.length > 1 ? ` · ${docName(v.doctor_id)}` : ""}{v.next_visit_notes ? ` · ${v.next_visit_notes}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {v.recall_sent_at ? (
                            <>
                              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Sent {friendlyDate(v.recall_sent_at.slice(0, 10))}</span>
                              <Button size="sm" variant="ghost" className="h-8 px-2" title="Mark as not sent" onClick={() => mark("visit_records", v.id, false)}><RotateCcw className="h-3.5 w-3.5" /></Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" className="h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" onClick={() => send(v.patient?.phone, text, () => mark("visit_records", v.id, true))}>
                                <MessageCircle className="mr-1.5 h-4 w-4" /> Send message
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => mark("visit_records", v.id, true)}>Mark sent</Button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
