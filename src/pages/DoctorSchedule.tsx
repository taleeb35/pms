import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, Clock, Plus, Trash2, Save } from "lucide-react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/activityLogger";

interface DaySchedule {
  id?: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
}

interface Leave {
  id: string;
  leave_date: string;
  leave_type: string;
  reason: string | null;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DoctorSchedule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [addLeaveOpen, setAddLeaveOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_date: new Date(),
    leave_type: "full_day",
    reason: "",
  });

  useEffect(() => {
    fetchSchedules();
    fetchLeaves();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", user.id)
        .order("day_of_week");

      if (error) throw error;

      // Initialize all 7 days with defaults if not present
      const existingSchedules = data || [];
      const fullSchedule: DaySchedule[] = [];

      for (let i = 0; i < 7; i++) {
        const existing = existingSchedules.find((s) => s.day_of_week === i);
        if (existing) {
          fullSchedule.push({
            id: existing.id,
            day_of_week: existing.day_of_week,
            is_available: existing.is_available,
            start_time: existing.start_time || "09:00",
            end_time: existing.end_time || "17:00",
            break_start: existing.break_start || "13:00",
            break_end: existing.break_end || "14:00",
          });
        } else {
          fullSchedule.push({
            day_of_week: i,
            is_available: i !== 0, // Sunday off by default
            start_time: "09:00",
            end_time: "17:00",
            break_start: "13:00",
            break_end: "14:00",
          });
        }
      }

      setSchedules(fullSchedule);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = format(new Date(), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("doctor_leaves")
        .select("*")
        .eq("doctor_id", user.id)
        .gte("leave_date", today)
        .order("leave_date");

      if (error) throw error;
      setLeaves(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleScheduleChange = (dayIndex: number, field: keyof DaySchedule, value: any) => {
    setSchedules((prev) =>
      prev.map((s) => (s.day_of_week === dayIndex ? { ...s, [field]: value } : s))
    );
  };

  const saveSchedules = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const schedule of schedules) {
        const scheduleData = {
          doctor_id: user.id,
          day_of_week: schedule.day_of_week,
          is_available: schedule.is_available,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          break_start: schedule.break_start,
          break_end: schedule.break_end,
        };

        if (schedule.id) {
          const { error } = await supabase
            .from("doctor_schedules")
            .update(scheduleData)
            .eq("id", schedule.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("doctor_schedules")
            .insert(scheduleData);
          if (error) throw error;
        }
      }

      // Log activity
      await logActivity({
        action: "schedule_updated",
        entityType: "schedule",
        entityId: user.id,
        details: { doctorId: user.id },
      });

      toast({
        title: "Schedule Saved",
        description: "Your weekly schedule has been updated successfully.",
      });

      fetchSchedules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addLeave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("doctor_leaves").insert({
        doctor_id: user.id,
        leave_date: format(newLeave.leave_date, "yyyy-MM-dd"),
        leave_type: newLeave.leave_type,
        reason: newLeave.reason || null,
      });

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "leave_added",
        entityType: "leave",
        entityId: user.id,
        details: {
          doctorId: user.id,
          leaveDate: format(newLeave.leave_date, "yyyy-MM-dd"),
          leaveType: newLeave.leave_type,
        },
      });

      toast({
        title: "Leave Added",
        description: `Leave on ${format(newLeave.leave_date, "PPP")} has been scheduled.`,
      });

      setAddLeaveOpen(false);
      setNewLeave({
        leave_date: new Date(),
        leave_type: "full_day",
        reason: "",
      });
      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const leaveInfo = leaves.find((l) => l.id === id);
      
      const { error } = await supabase.from("doctor_leaves").delete().eq("id", id);
      if (error) throw error;

      // Log activity
      await logActivity({
        action: "leave_deleted",
        entityType: "leave",
        entityId: user.id,
        details: {
          doctorId: user.id,
          leaveId: id,
          leaveDate: leaveInfo?.leave_date,
          leaveType: leaveInfo?.leave_type,
        },
      });

      toast({
        title: "Leave Cancelled",
        description: "The leave has been removed.",
      });

      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const quickAddLeave = async (daysFromToday: number) => {
    const targetDate = addDays(new Date(), daysFromToday);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("doctor_leaves").insert({
        doctor_id: user.id,
        leave_date: format(targetDate, "yyyy-MM-dd"),
        leave_type: "full_day",
        reason: null,
      });

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "leave_added",
        entityType: "leave",
        entityId: user.id,
        details: {
          doctorId: user.id,
          leaveDate: format(targetDate, "yyyy-MM-dd"),
          leaveType: "full_day",
        },
      });

      toast({
        title: "Leave Added",
        description: `You are now off on ${format(targetDate, "PPP")}.`,
      });

      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case "full_day":
        return "Full Day";
      case "half_day_morning":
        return "Morning Off";
      case "half_day_evening":
        return "Evening Off";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timing & Schedule</h1>
        <p className="text-muted-foreground">
          Manage your weekly availability and leaves
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">
            <Clock className="h-4 w-4 mr-2" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="leaves">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Leaves & Days Off
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>
                Set your working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.day_of_week}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-6 gap-4 p-4 rounded-lg border",
                    schedule.is_available ? "bg-card" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3 md:col-span-1">
                    <Switch
                      checked={schedule.is_available}
                      onCheckedChange={(checked) =>
                        handleScheduleChange(schedule.day_of_week, "is_available", checked)
                      }
                    />
                    <Label className="font-medium min-w-[80px]">
                      {DAYS_OF_WEEK[schedule.day_of_week]}
                    </Label>
                  </div>

                  {schedule.is_available && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Time</Label>
                        <Input
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) =>
                            handleScheduleChange(schedule.day_of_week, "start_time", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">End Time</Label>
                        <Input
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) =>
                            handleScheduleChange(schedule.day_of_week, "end_time", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Break Start</Label>
                        <Input
                          type="time"
                          value={schedule.break_start}
                          onChange={(e) =>
                            handleScheduleChange(schedule.day_of_week, "break_start", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Break End</Label>
                        <Input
                          type="time"
                          value={schedule.break_end}
                          onChange={(e) =>
                            handleScheduleChange(schedule.day_of_week, "break_end", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}

                  {!schedule.is_available && (
                    <div className="md:col-span-4 flex items-center text-muted-foreground">
                      Day Off
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button onClick={saveSchedules} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Leaves</CardTitle>
                <CardDescription>
                  Schedule days off for specific dates
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickAddLeave(1)}
                >
                  Off Tomorrow
                </Button>
                <Button size="sm" onClick={() => setAddLeaveOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leave
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming leaves scheduled
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell className="font-medium">
                          {format(new Date(leave.leave_date), "PPP")}
                        </TableCell>
                        <TableCell>{getLeaveTypeLabel(leave.leave_type)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {leave.reason || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteLeave(leave.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Leave Dialog */}
      <Dialog open={addLeaveOpen} onOpenChange={setAddLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newLeave.leave_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newLeave.leave_date
                      ? format(newLeave.leave_date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newLeave.leave_date}
                    onSelect={(date) =>
                      date && setNewLeave({ ...newLeave, leave_date: date })
                    }
                    disabled={(date) =>
                      isBefore(date, startOfDay(new Date()))
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={newLeave.leave_type}
                onValueChange={(value) =>
                  setNewLeave({ ...newLeave, leave_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="half_day_morning">Morning Off</SelectItem>
                  <SelectItem value="half_day_evening">Evening Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={newLeave.reason}
                onChange={(e) =>
                  setNewLeave({ ...newLeave, reason: e.target.value })
                }
                placeholder="e.g., Personal leave, Conference, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLeaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addLeave}>Add Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSchedule;
