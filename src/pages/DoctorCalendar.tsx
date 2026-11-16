import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2, Pencil, User, Plane } from "lucide-react";
import {
  addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday,
  parseISO, startOfMonth, startOfWeek, subMonths, subWeeks,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useStickyState } from "@/hooks/useStickyState";
import { friendlyTime } from "@/lib/datetime";
import { buildCalendarDays, leaveLabel, type CalAppt, type CalItem, type CalLeave } from "@/lib/calendarItems";

type Task = {
  id: string;
  doctor_id: string;
  title: string;
  description: string | null;
  due_date: string; // YYYY-MM-DD
  due_time: string | null; // HH:MM:SS
  priority: "low" | "medium" | "high";
  color: string;
  completed: boolean;
};

const COLORS = [
  { value: "blue", className: "bg-blue-500" },
  { value: "green", className: "bg-green-500" },
  { value: "amber", className: "bg-amber-500" },
  { value: "rose", className: "bg-rose-500" },
  { value: "violet", className: "bg-violet-500" },
  { value: "cyan", className: "bg-cyan-500" },
];

const colorBg = (c: string) => COLORS.find((x) => x.value === c)?.className ?? "bg-blue-500";

const priorityColor = (p: string) =>
  p === "high"
    ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
    : p === "low"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      : "bg-amber-500/10 text-amber-600 border-amber-500/30";

const STATUS_LABEL: Record<string, string> = { scheduled: "Scheduled", start: "Started", completed: "Completed", no_show: "No-show" };

const emptyForm = (date?: Date) => ({
  id: "",
  title: "",
  description: "",
  due_date: format(date ?? new Date(), "yyyy-MM-dd"),
  due_time: "",
  priority: "medium" as Task["priority"],
  color: "blue",
});

type Show = { appts: boolean; leaves: boolean; tasks: boolean };

const DoctorCalendar = () => {
  useSEO({ title: "Calendar | Doctor Portal", description: "Appointments, leave days and private tasks in one calendar" });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appts, setAppts] = useState<CalAppt[]>([]);
  const [leaves, setLeaves] = useState<CalLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useStickyState<"month" | "week" | "day" | "agenda">("doctorCalendar.view", "month");
  const [show, setShow] = useStickyState<Show>("doctorCalendar.show", { appts: true, leaves: true, tasks: true });
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [userId, setUserId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);
    const [t, l] = await Promise.all([
      supabase.from("doctor_calendar_tasks").select("*").eq("doctor_id", user.id)
        .order("due_date", { ascending: true }).order("due_time", { ascending: true }),
      supabase.from("doctor_leaves").select("id, leave_date, leave_type, reason").eq("doctor_id", user.id),
    ]);
    if (t.error) toast({ title: "Failed to load", description: t.error.message, variant: "destructive" });
    setTasks((t.data ?? []) as Task[]);
    setLeaves((l.data ?? []) as CalLeave[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  // Appointments for a window around the month on screen (reloaded when moving far enough).
  const windowKey = format(startOfMonth(cursor), "yyyy-MM");
  useEffect(() => {
    if (!userId) return;
    const from = format(startOfWeek(subMonths(startOfMonth(cursor), 1)), "yyyy-MM-dd");
    const to = format(endOfWeek(addMonths(endOfMonth(cursor), 1)), "yyyy-MM-dd");
    let alive = true;
    supabase.from("appointments")
      .select("id, appointment_date, appointment_time, status, source, lead_status, patients(full_name)")
      .eq("doctor_id", userId).gte("appointment_date", from).lte("appointment_date", to).neq("status", "cancelled")
      .order("appointment_time").limit(3000)
      .then(({ data }) => { if (alive) setAppts((data ?? []) as CalAppt[]); });
    return () => { alive = false; };
  }, [userId, windowKey]);

  const days = useMemo(() => buildCalendarDays(appts, leaves, tasks, show), [appts, leaves, tasks, show]);
  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const dayOf = (d: Date) => days.get(format(d, "yyyy-MM-dd")) ?? { leave: null, items: [] as CalItem[] };

  const openNew = (date?: Date) => { setForm(emptyForm(date)); setOpen(true); };

  const openEdit = (t: Task) => {
    setForm({
      id: t.id, title: t.title, description: t.description ?? "", due_date: t.due_date,
      due_time: t.due_time ? t.due_time.slice(0, 5) : "", priority: t.priority, color: t.color,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      doctor_id: user.id, title: form.title.trim(), description: form.description.trim() || null,
      due_date: form.due_date, due_time: form.due_time || null, priority: form.priority, color: form.color,
    };
    const res = form.id
      ? await supabase.from("doctor_calendar_tasks").update(payload).eq("id", form.id)
      : await supabase.from("doctor_calendar_tasks").insert(payload);
    if (res.error) { toast({ title: "Save failed", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: form.id ? "Task updated" : "Task added" });
    setOpen(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("doctor_calendar_tasks").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  const toggleComplete = async (t: Task) => {
    const { error } = await supabase.from("doctor_calendar_tasks")
      .update({ completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null }).eq("id", t.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    void load();
  };

  // Month grid
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) monthDays.push(d);

  // Week
  const weekStart = startOfWeek(cursor, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const navPrev = () => {
    if (view === "month") setCursor(subMonths(cursor, 1));
    else if (view === "week") setCursor(subWeeks(cursor, 1));
    else if (view === "day") setCursor(addDays(cursor, -1));
    else setCursor(subMonths(cursor, 1));
  };
  const navNext = () => {
    if (view === "month") setCursor(addMonths(cursor, 1));
    else if (view === "week") setCursor(addWeeks(cursor, 1));
    else if (view === "day") setCursor(addDays(cursor, 1));
    else setCursor(addMonths(cursor, 1));
  };

  const headerLabel =
    view === "month" ? format(cursor, "MMMM yyyy")
      : view === "week" ? `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
        : view === "day" ? format(cursor, "EEEE, MMMM d, yyyy")
          : "Coming up";

  const goDay = (d: Date) => { setCursor(d); setView("day"); };
  const openAppt = (id: string) => navigate(`/doctor/appointments/${id}`);

  // A single line in month/week cells.
  const Chip = ({ it, compact = false }: { it: CalItem; compact?: boolean }) => {
    const size = compact ? "text-[10px]" : "text-xs";
    if (it.kind === "appt") {
      return (
        <div onClick={(e) => { e.stopPropagation(); openAppt(it.id); }} title={`${it.title} · ${STATUS_LABEL[it.status] || it.status}`}
          className={`flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 ${size} text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-500/20 ${it.status === "completed" ? "opacity-60" : ""}`}>
          <User className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{it.time ? `${compact ? friendlyTime(it.time).replace(/\s?([ap])\.?m\.?$/i, (_, x) => x.toLowerCase()) : friendlyTime(it.time)} ` : ""}{it.title}</span>
        </div>
      );
    }
    const t = tasksById.get(it.id);
    return (
      <div onClick={(e) => { e.stopPropagation(); if (t) openEdit(t); }}
        className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 ${size} text-white cursor-pointer hover:opacity-90 ${colorBg(it.color)} ${it.completed ? "opacity-50 line-through" : ""}`}>
        {it.time && <Clock className="h-2.5 w-2.5 shrink-0" />}
        <span className="truncate">{it.time ? `${it.time.slice(0, 5)} ` : ""}{it.title}</span>
      </div>
    );
  };

  const LeaveTag = ({ l }: { l: CalLeave }) => (
    <span title={l.reason || undefined} className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
      <Plane className="h-2.5 w-2.5" /> {leaveLabel(l)}
    </span>
  );

  // Full list for one day (Day and Coming up views).
  const DayDetailList = ({ date }: { date: Date }) => {
    const { leave, items } = dayOf(date);
    if (!leave && items.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">Nothing on this day.</p>;
    return (
      <div className="space-y-2">
        {leave && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm dark:bg-amber-950/40">
            <Plane className="h-4 w-4 text-amber-600" /> <span className="font-medium">{leaveLabel(leave)}</span>
            {leave.reason && <span className="text-muted-foreground">· {leave.reason}</span>}
          </div>
        )}
        {items.map((it) => {
          if (it.kind === "appt") {
            return (
              <button key={`a-${it.id}`} type="button" onClick={() => openAppt(it.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-left transition hover:bg-blue-500/10">
                <User className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="w-20 shrink-0 text-sm tabular-nums text-muted-foreground">{it.time ? friendlyTime(it.time) : ""}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{it.title}</span>
                <Badge variant="outline" className="shrink-0">{STATUS_LABEL[it.status] || it.status}</Badge>
              </button>
            );
          }
          const t = tasksById.get(it.id);
          if (!t) return null;
          return (
            <div key={`t-${t.id}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 transition">
              <Checkbox checked={t.completed} onCheckedChange={() => toggleComplete(t)} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${colorBg(t.color)}`} />
                  <span className={`font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                  <Badge variant="outline" className={priorityColor(t.priority)}>{t.priority}</Badge>
                  {t.due_time && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{t.due_time.slice(0, 5)}</span>
                  )}
                </div>
                {t.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const FILTERS: { key: keyof Show; label: string; dot: string }[] = [
    { key: "appts", label: "Appointments", dot: "bg-blue-500" },
    { key: "leaves", label: "Leave", dot: "bg-amber-500" },
    { key: "tasks", label: "My tasks", dot: "bg-violet-500" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Appointments, leave days and your tasks in one place. Tasks are private to you.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={navPrev} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={navNext} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openNew()} className="gap-1"><Plus className="h-4 w-4" /> Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit Task" : "New Task"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Review patient files" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date *</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={form.due_time} onChange={(e) => setForm({ ...form, due_time: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {COLORS.map((c) => (
                        <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value })}
                          className={`w-7 h-7 rounded-full ${c.className} ${form.color === c.value ? "ring-2 ring-offset-2 ring-foreground" : ""}`} aria-label={c.value} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {form.id && (
                  <Button variant="outline" className="mr-auto" onClick={() => { remove(form.id); setOpen(false); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>{form.id ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => { setView(v as typeof view); if (v === "agenda") setCursor(new Date()); }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">{headerLabel}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" aria-pressed={show[f.key]} onClick={() => setShow({ ...show, [f.key]: !show[f.key] })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${show[f.key] ? "bg-background" : "opacity-50 line-through"}`}>
                <span className={`h-2 w-2 rounded-full ${f.dot}`} /> {f.label}
              </button>
            ))}
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Coming up</TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* MONTH */}
        <TabsContent value="month" className="mt-3">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-7 border-b bg-muted/30 text-xs font-medium">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="px-2 py-2 text-center">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((d) => {
                    const key = format(d, "yyyy-MM-dd");
                    const { leave, items } = dayOf(d);
                    const inMonth = isSameMonth(d, cursor);
                    return (
                      <div key={key} onClick={() => openNew(d)}
                        className={`min-h-[110px] border-b border-r p-1.5 cursor-pointer hover:bg-accent/30 transition ${inMonth ? "" : "bg-muted/20 text-muted-foreground"} ${leave ? "bg-amber-50/60 dark:bg-amber-950/20" : ""}`}>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday(d) ? "bg-primary text-primary-foreground" : ""}`}>
                            {format(d, "d")}
                          </span>
                          {leave && <LeaveTag l={leave} />}
                        </div>
                        <div className="space-y-0.5">
                          {items.slice(0, 3).map((it) => <Chip key={`${it.kind}-${it.id}`} it={it} compact />)}
                          {items.length > 3 && (
                            <button type="button" className="text-[10px] text-muted-foreground px-1 hover:underline" onClick={(e) => { e.stopPropagation(); goDay(d); }}>
                              +{items.length - 3} more
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEEK */}
        <TabsContent value="week" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const { leave, items } = dayOf(d);
              return (
                <Card key={key} className={`${isToday(d) ? "border-primary" : ""} ${leave ? "bg-amber-50/60 dark:bg-amber-950/20" : ""}`}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center justify-between gap-2">
                      <button type="button" className="hover:underline" onClick={() => goDay(d)}>{format(d, "EEE d")}</button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openNew(d)} aria-label="Add task"><Plus className="h-3.5 w-3.5" /></Button>
                    </CardTitle>
                    {leave && <LeaveTag l={leave} />}
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1 min-h-[120px]">
                    {items.length === 0 ? <p className="text-xs text-muted-foreground">—</p> : items.map((it) => <Chip key={`${it.kind}-${it.id}`} it={it} />)}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* DAY */}
        <TabsContent value="day" className="mt-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">{format(cursor, "EEEE, MMMM d, yyyy")}</CardTitle>
              <Button size="sm" variant="outline" onClick={() => openNew(cursor)}><Plus className="h-4 w-4 mr-1" /> Task</Button>
            </CardHeader>
            <CardContent>
              <DayDetailList date={cursor} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMING UP: the next 14 days that have something on them */}
        <TabsContent value="agenda" className="mt-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Next 14 days</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (() => {
                const today = new Date();
                const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i)).filter((d) => {
                  const v = dayOf(d); return v.leave || v.items.length;
                });
                if (dates.length === 0) return <p className="text-sm text-muted-foreground">Nothing in the next 14 days.</p>;
                return (
                  <div className="space-y-4">
                    {dates.map((d) => (
                      <div key={format(d, "yyyy-MM-dd")}>
                        <div className="text-sm font-semibold text-primary mb-2">
                          {format(d, "EEEE, MMMM d")}
                          {isSameDay(d, today) && <Badge className="ml-2">Today</Badge>}
                        </div>
                        <DayDetailList date={parseISO(format(d, "yyyy-MM-dd"))} />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorCalendar;
