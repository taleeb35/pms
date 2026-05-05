import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

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

const colorBg = (c: string) =>
  COLORS.find((x) => x.value === c)?.className ?? "bg-blue-500";

const priorityColor = (p: string) =>
  p === "high"
    ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
    : p === "low"
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      : "bg-amber-500/10 text-amber-600 border-amber-500/30";

const emptyForm = (date?: Date) => ({
  id: "",
  title: "",
  description: "",
  due_date: format(date ?? new Date(), "yyyy-MM-dd"),
  due_time: "",
  priority: "medium" as Task["priority"],
  color: "blue",
});

const DoctorCalendar = () => {
  useSEO({ title: "My Calendar | Doctor Portal", description: "Personal tasks and events calendar" });
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month");
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("doctor_calendar_tasks")
      .select("*")
      .eq("doctor_id", user.id)
      .order("due_date", { ascending: true })
      .order("due_time", { ascending: true });
    if (error) toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    setTasks((data ?? []) as Task[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      const arr = map.get(t.due_date) ?? [];
      arr.push(t);
      map.set(t.due_date, arr);
    });
    return map;
  }, [tasks]);

  const openNew = (date?: Date) => {
    setForm(emptyForm(date));
    setOpen(true);
  };

  const openEdit = (t: Task) => {
    setForm({
      id: t.id,
      title: t.title,
      description: t.description ?? "",
      due_date: t.due_date,
      due_time: t.due_time ? t.due_time.slice(0, 5) : "",
      priority: t.priority,
      color: t.color,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      doctor_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      due_date: form.due_date,
      due_time: form.due_time || null,
      priority: form.priority,
      color: form.color,
    };
    const res = form.id
      ? await supabase.from("doctor_calendar_tasks").update(payload).eq("id", form.id)
      : await supabase.from("doctor_calendar_tasks").insert(payload);
    if (res.error) {
      toast({ title: "Save failed", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: form.id ? "Task updated" : "Task added" });
    setOpen(false);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("doctor_calendar_tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    void load();
  };

  const toggleComplete = async (t: Task) => {
    const { error } = await supabase
      .from("doctor_calendar_tasks")
      .update({ completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null })
      .eq("id", t.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
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
    view === "month"
      ? format(cursor, "MMMM yyyy")
      : view === "week"
        ? `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`
        : view === "day"
          ? format(cursor, "EEEE, MMMM d, yyyy")
          : "Upcoming";

  const TaskItem = ({ t, compact = false }: { t: Task; compact?: boolean }) => (
    <div
      onClick={(e) => { e.stopPropagation(); openEdit(t); }}
      className={`group flex items-center gap-1.5 px-1.5 py-0.5 rounded cursor-pointer hover:opacity-90 ${compact ? "text-[10px]" : "text-xs"} text-white ${colorBg(t.color)} ${t.completed ? "opacity-50 line-through" : ""}`}
    >
      {t.due_time && <Clock className="h-2.5 w-2.5 shrink-0" />}
      <span className="truncate">{t.due_time ? `${t.due_time.slice(0, 5)} ` : ""}{t.title}</span>
    </div>
  );

  const DayDetailList = ({ date }: { date: Date }) => {
    const list = tasksByDate.get(format(date, "yyyy-MM-dd")) ?? [];
    if (list.length === 0)
      return <p className="text-sm text-muted-foreground py-4 text-center">No tasks for this day.</p>;
    return (
      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/40 transition">
            <Checkbox checked={t.completed} onCheckedChange={() => toggleComplete(t)} className="mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${colorBg(t.color)}`} />
                <span className={`font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                <Badge variant="outline" className={priorityColor(t.priority)}>{t.priority}</Badge>
                {t.due_time && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />{t.due_time.slice(0, 5)}
                  </span>
                )}
              </div>
              {t.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.description}</p>}
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" /> My Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Your private tasks and events. Only you can see this.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={navPrev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={navNext}><ChevronRight className="h-4 w-4" /></Button>
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
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setForm({ ...form, color: c.value })}
                          className={`w-7 h-7 rounded-full ${c.className} ${form.color === c.value ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                          aria-label={c.value}
                        />
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

      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">{headerLabel}</h2>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </div>

        {/* MONTH */}
        <TabsContent value="month" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b bg-muted/30 text-xs font-medium">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="px-2 py-2 text-center">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((d) => {
                  const key = format(d, "yyyy-MM-dd");
                  const list = tasksByDate.get(key) ?? [];
                  const inMonth = isSameMonth(d, cursor);
                  return (
                    <div
                      key={key}
                      onClick={() => openNew(d)}
                      className={`min-h-[110px] border-b border-r p-1.5 cursor-pointer hover:bg-accent/30 transition ${inMonth ? "" : "bg-muted/20 text-muted-foreground"}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday(d) ? "bg-primary text-primary-foreground" : ""}`}>
                          {format(d, "d")}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {list.slice(0, 3).map((t) => <TaskItem key={t.id} t={t} compact />)}
                        {list.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{list.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEEK */}
        <TabsContent value="week" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const list = tasksByDate.get(key) ?? [];
              return (
                <Card key={key} className={isToday(d) ? "border-primary" : ""}>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{format(d, "EEE d")}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openNew(d)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1 min-h-[120px]">
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground">—</p>
                    ) : (
                      list.map((t) => <TaskItem key={t.id} t={t} />)
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* DAY */}
        <TabsContent value="day" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{format(cursor, "EEEE, MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <DayDetailList date={cursor} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGENDA */}
        <TabsContent value="agenda" className="mt-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming Tasks</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (() => {
                const today = format(new Date(), "yyyy-MM-dd");
                const upcoming = tasks.filter((t) => t.due_date >= today);
                if (upcoming.length === 0)
                  return <p className="text-sm text-muted-foreground">No upcoming tasks.</p>;
                const grouped = new Map<string, Task[]>();
                upcoming.forEach((t) => {
                  const arr = grouped.get(t.due_date) ?? [];
                  arr.push(t);
                  grouped.set(t.due_date, arr);
                });
                return (
                  <div className="space-y-4">
                    {Array.from(grouped.entries()).map(([date, list]) => (
                      <div key={date}>
                        <div className="text-sm font-semibold text-primary mb-2">
                          {format(parseISO(date), "EEEE, MMMM d")}
                          {isSameDay(parseISO(date), new Date()) && <Badge className="ml-2">Today</Badge>}
                        </div>
                        <DayDetailList date={parseISO(date)} />
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
