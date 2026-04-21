import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MobileScreen from "@/components/mobile/MobileScreen";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMobileRole } from "@/hooks/useMobileRole";
import { CalendarDays, Plus, Save, Trash2, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import MobilePlaceholder from "@/components/mobile/MobilePlaceholder";

interface DaySchedule {
  id?: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
}

interface Leave {
  id: string;
  leave_date: string;
  leave_type: string;
  reason: string | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const MobileSchedule = () => {
  const { toast } = useToast();
  const { id: userId, role, loading: roleLoading } = useMobileRole();
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addLeaveOpen, setAddLeaveOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_date: format(new Date(), "yyyy-MM-dd"),
    leave_type: "full_day",
    reason: "",
  });

  useEffect(() => {
    if (!userId || role !== "doctor") return;
    const load = async () => {
      const [{ data: sch }, { data: lv }] = await Promise.all([
        supabase.from("doctor_schedules").select("*").eq("doctor_id", userId).order("day_of_week"),
        supabase.from("doctor_leaves").select("*").eq("doctor_id", userId)
          .gte("leave_date", format(new Date(), "yyyy-MM-dd"))
          .order("leave_date"),
      ]);

      const full: DaySchedule[] = [];
      for (let i = 0; i < 7; i++) {
        const ex = sch?.find((s) => s.day_of_week === i);
        full.push(ex ? {
          id: ex.id,
          day_of_week: ex.day_of_week,
          is_available: ex.is_available,
          start_time: ex.start_time || "09:00",
          end_time: ex.end_time || "17:00",
        } : {
          day_of_week: i,
          is_available: i !== 0,
          start_time: "09:00",
          end_time: "17:00",
        });
      }
      setSchedules(full);
      setLeaves(lv || []);
      setLoading(false);
    };
    load();
  }, [userId, role]);

  if (!roleLoading && role !== "doctor") {
    return <MobilePlaceholder title="Schedule" icon={CalendarDays} webPath="/clinic/schedules" />;
  }

  const updateDay = (idx: number, patch: Partial<DaySchedule>) => {
    setSchedules((s) => s.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const saveSchedule = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      for (const day of schedules) {
        if (day.id) {
          await supabase.from("doctor_schedules").update({
            is_available: day.is_available,
            start_time: day.is_available ? day.start_time : null,
            end_time: day.is_available ? day.end_time : null,
          }).eq("id", day.id);
        } else {
          await supabase.from("doctor_schedules").insert({
            doctor_id: userId,
            day_of_week: day.day_of_week,
            is_available: day.is_available,
            start_time: day.is_available ? day.start_time : null,
            end_time: day.is_available ? day.end_time : null,
          });
        }
      }
      toast({ title: "Schedule saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addLeave = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from("doctor_leaves").insert({
      doctor_id: userId,
      leave_date: newLeave.leave_date,
      leave_type: newLeave.leave_type,
      reason: newLeave.reason || null,
    }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setLeaves((l) => [...l, data].sort((a, b) => a.leave_date.localeCompare(b.leave_date)));
    setAddLeaveOpen(false);
    setNewLeave({ leave_date: format(new Date(), "yyyy-MM-dd"), leave_type: "full_day", reason: "" });
    toast({ title: "Leave added" });
  };

  const removeLeave = async (id: string) => {
    await supabase.from("doctor_leaves").delete().eq("id", id);
    setLeaves((l) => l.filter((x) => x.id !== id));
    toast({ title: "Leave removed" });
  };

  return (
    <MobileScreen title="Schedule & Leaves">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="weekly">
          <TabsList className="grid grid-cols-2 w-full h-10 rounded-xl bg-muted/50">
            <TabsTrigger value="weekly" className="text-xs rounded-lg">Weekly hours</TabsTrigger>
            <TabsTrigger value="leaves" className="text-xs rounded-lg">Leaves ({leaves.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-3 space-y-2">
            {schedules.map((day, idx) => (
              <Card key={day.day_of_week} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">{FULL_DAYS[day.day_of_week]}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {day.is_available ? `${day.start_time} – ${day.end_time}` : "Off"}
                    </div>
                  </div>
                  <Switch
                    checked={day.is_available}
                    onCheckedChange={(v) => updateDay(idx, { is_available: v })}
                  />
                </div>
                {day.is_available && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Start</Label>
                      <Input
                        type="time"
                        value={day.start_time}
                        onChange={(e) => updateDay(idx, { start_time: e.target.value })}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">End</Label>
                      <Input
                        type="time"
                        value={day.end_time}
                        onChange={(e) => updateDay(idx, { end_time: e.target.value })}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
            <Button onClick={saveSchedule} disabled={saving} className="w-full h-12 rounded-xl mt-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" />Save schedule</>}
            </Button>
          </TabsContent>

          <TabsContent value="leaves" className="mt-3 space-y-2">
            <Sheet open={addLeaveOpen} onOpenChange={setAddLeaveOpen}>
              <SheetTrigger asChild>
                <Button className="w-full h-12 rounded-xl mb-2">
                  <Plus className="h-4 w-4 mr-2" />Add leave
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader><SheetTitle>Add leave</SheetTitle></SheetHeader>
                <div className="space-y-3 mt-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newLeave.leave_date}
                      onChange={(e) => setNewLeave((l) => ({ ...l, leave_date: e.target.value }))}
                      className="h-11 rounded-lg"
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newLeave.leave_type} onValueChange={(v) => setNewLeave((l) => ({ ...l, leave_type: v }))}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_day">Full day</SelectItem>
                        <SelectItem value="half_day_morning">Morning (Half day)</SelectItem>
                        <SelectItem value="half_day_evening">Evening (Half day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reason (optional)</Label>
                    <Textarea value={newLeave.reason} onChange={(e) => setNewLeave((l) => ({ ...l, reason: e.target.value }))} rows={2} />
                  </div>
                  <Button onClick={addLeave} className="w-full h-11">Add leave</Button>
                </div>
              </SheetContent>
            </Sheet>

            {leaves.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No upcoming leaves.</div>
            ) : (
              leaves.map((lv) => (
                <Card key={lv.id} className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{format(new Date(lv.leave_date), "dd MMM yyyy")}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">
                      {lv.leave_type.replace(/_/g, " ")}{lv.reason ? ` · ${lv.reason}` : ""}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeLeave(lv.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </MobileScreen>
  );
};

export default MobileSchedule;
