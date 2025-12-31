import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, Trash2, Plus, User, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { logActivity } from "@/lib/activityLogger";

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  };
  specialization: string;
}

interface Schedule {
  id?: string;
  doctor_id: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface Leave {
  id: string;
  doctor_id: string;
  leave_date: string;
  leave_type: string;
  reason: string | null;
}

const DAYS_OF_WEEK = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

interface ClinicDoctorSchedulesProps {
  readOnly?: boolean;
}

const ClinicDoctorSchedules = ({ readOnly = false }: ClinicDoctorSchedulesProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<"clinic" | "receptionist">("clinic");
  
  // Leave form state
  const [leaveDate, setLeaveDate] = useState<Date | undefined>(undefined);
  const [leaveType, setLeaveType] = useState("full_day");
  const [leaveReason, setLeaveReason] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchSchedules();
      fetchLeaves();
    }
  }, [selectedDoctorId]);

  const fetchDoctors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a clinic owner
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (clinicData) {
        setUserType("clinic");
        const { data, error } = await supabase
          .from("doctors")
          .select("id, specialization, profiles(full_name)")
          .eq("clinic_id", user.id)
          .eq("approved", true);

        if (error) throw error;
        setDoctors(data || []);
        if (data && data.length > 0) {
          setSelectedDoctorId(data[0].id);
        }
      } else {
        // Check if user is a receptionist
        const { data: receptionistData } = await supabase
          .from("clinic_receptionists")
          .select("clinic_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (receptionistData) {
          setUserType("receptionist");
          const { data, error } = await supabase
            .from("doctors")
            .select("id, specialization, profiles(full_name)")
            .eq("clinic_id", receptionistData.clinic_id)
            .eq("approved", true);

          if (error) throw error;
          setDoctors(data || []);
          if (data && data.length > 0) {
            setSelectedDoctorId(data[0].id);
          }
        }
      }
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

  const fetchSchedules = async () => {
    if (!selectedDoctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", selectedDoctorId)
        .order("day_of_week");

      if (error) throw error;

      // Initialize all days if not present
      const existingDays = new Set(data?.map(s => s.day_of_week) || []);
      const allSchedules: Schedule[] = [];
      
      for (let i = 0; i < 7; i++) {
        const existing = data?.find(s => s.day_of_week === i);
        if (existing) {
          allSchedules.push(existing);
        } else {
          allSchedules.push({
            doctor_id: selectedDoctorId,
            day_of_week: i,
            is_available: true,
            start_time: "09:00",
            end_time: "17:00",
            break_start: null,
            break_end: null,
          });
        }
      }
      
      setSchedules(allSchedules);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchLeaves = async () => {
    if (!selectedDoctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("doctor_leaves")
        .select("*")
        .eq("doctor_id", selectedDoctorId)
        .gte("leave_date", format(new Date(), "yyyy-MM-dd"))
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

  const updateSchedule = (dayIndex: number, field: keyof Schedule, value: any) => {
    setSchedules(prev => prev.map((s, i) => 
      i === dayIndex ? { ...s, [field]: value } : s
    ));
  };

  const saveSchedules = async () => {
    if (!selectedDoctorId) return;
    
    setSaving(true);
    try {
      for (const schedule of schedules) {
        const scheduleData = {
          doctor_id: selectedDoctorId,
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
      const doctorName = doctors.find((d) => d.id === selectedDoctorId)?.profiles?.full_name || "Doctor";
      await logActivity({
        action: "schedule_updated",
        entityType: "schedule",
        entityId: selectedDoctorId,
        details: { doctorId: selectedDoctorId, doctorName },
      });

      toast({
        title: "Success",
        description: "Doctor schedule saved successfully",
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
    if (!selectedDoctorId || !leaveDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("doctor_leaves")
        .insert({
          doctor_id: selectedDoctorId,
          leave_date: format(leaveDate, "yyyy-MM-dd"),
          leave_type: leaveType,
          reason: leaveReason || null,
        });

      if (error) throw error;

      // Log activity
      const doctorName = doctors.find((d) => d.id === selectedDoctorId)?.profiles?.full_name || "Doctor";
      await logActivity({
        action: "leave_added",
        entityType: "leave",
        entityId: selectedDoctorId,
        details: {
          doctorId: selectedDoctorId,
          doctorName,
          leaveDate: format(leaveDate, "yyyy-MM-dd"),
          leaveType,
        },
      });

      toast({
        title: "Success",
        description: "Leave added successfully",
      });
      
      setLeaveDate(undefined);
      setLeaveReason("");
      setLeaveType("full_day");
      fetchLeaves();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLeave = async (leaveId: string) => {
    try {
      const { error } = await supabase
        .from("doctor_leaves")
        .delete()
        .eq("id", leaveId);

      if (error) throw error;

      // Log activity
      const doctorName = doctors.find((d) => d.id === selectedDoctorId)?.profiles?.full_name || "Doctor";
      const leaveInfo = leaves.find((l) => l.id === leaveId);
      await logActivity({
        action: "leave_deleted",
        entityType: "leave",
        entityId: selectedDoctorId,
        details: {
          doctorId: selectedDoctorId,
          doctorName,
          leaveId,
          leaveDate: leaveInfo?.leave_date,
          leaveType: leaveInfo?.leave_type,
        },
      });

      toast({
        title: "Success",
        description: "Leave deleted successfully",
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

  const addTomorrowOff = async () => {
    if (!selectedDoctorId) return;
    
    const tomorrow = addDays(new Date(), 1);
    
    try {
      const { error } = await supabase
        .from("doctor_leaves")
        .insert({
          doctor_id: selectedDoctorId,
          leave_date: format(tomorrow, "yyyy-MM-dd"),
          leave_type: "full_day",
          reason: "Day off",
        });

      if (error) throw error;

      // Log activity
      const doctorName = doctors.find((d) => d.id === selectedDoctorId)?.profiles?.full_name || "Doctor";
      await logActivity({
        action: "leave_added",
        entityType: "leave",
        entityId: selectedDoctorId,
        details: {
          doctorId: selectedDoctorId,
          doctorName,
          leaveDate: format(tomorrow, "yyyy-MM-dd"),
          leaveType: "full_day",
        },
      });

      toast({
        title: "Success",
        description: `Doctor marked off for ${format(tomorrow, "EEEE, MMMM d")}`,
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

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No doctors found. Add doctors to manage their schedules.</p>
        </CardContent>
      </Card>
    );
  }

  const isReadOnly = readOnly || userType === "receptionist";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doctor Schedules</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? "View working hours and leaves for doctors" 
              : "Manage working hours and leaves for your doctors"}
          </p>
          {isReadOnly && (
            <Badge variant="secondary" className="mt-2">Read-only view</Badge>
          )}
        </div>
        
        <div className="w-full sm:w-64">
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{doctor.profiles?.full_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedDoctor && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedDoctor.profiles?.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Leaves & Days Off
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Working Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedules.map((schedule, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="w-32 font-medium">{DAYS_OF_WEEK[schedule.day_of_week]}</div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.is_available}
                      onCheckedChange={(checked) => updateSchedule(index, "is_available", checked)}
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-muted-foreground">
                      {schedule.is_available ? "Working" : "Off"}
                    </span>
                  </div>

                  {schedule.is_available && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Start:</Label>
                        <Input
                          type="time"
                          value={schedule.start_time || ""}
                          onChange={(e) => updateSchedule(index, "start_time", e.target.value)}
                          className="w-32"
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">End:</Label>
                        <Input
                          type="time"
                          value={schedule.end_time || ""}
                          onChange={(e) => updateSchedule(index, "end_time", e.target.value)}
                          className="w-32"
                          disabled={isReadOnly}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Break:</Label>
                        <Input
                          type="time"
                          value={schedule.break_start || ""}
                          onChange={(e) => updateSchedule(index, "break_start", e.target.value)}
                          className="w-28"
                          placeholder="Start"
                          disabled={isReadOnly}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={schedule.break_end || ""}
                          onChange={(e) => updateSchedule(index, "break_end", e.target.value)}
                          className="w-28"
                          placeholder="End"
                          disabled={isReadOnly}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}

              {!isReadOnly && (
                <Button onClick={saveSchedules} disabled={saving} className="w-full sm:w-auto">
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          {!isReadOnly && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Add Leave / Day Off</span>
                  <Button variant="outline" size="sm" onClick={addTomorrowOff}>
                    <Plus className="h-4 w-4 mr-2" />
                    Off Tomorrow
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Calendar
                      mode="single"
                      selected={leaveDate}
                      onSelect={setLeaveDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Leave Type</Label>
                      <Select value={leaveType} onValueChange={setLeaveType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_day">Full Day</SelectItem>
                          <SelectItem value="half_day_morning">Half Day (Morning Off)</SelectItem>
                          <SelectItem value="half_day_evening">Half Day (Evening Off)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason (Optional)</Label>
                      <Textarea
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Enter reason..."
                      />
                    </div>

                    <Button onClick={addLeave} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Leave
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming leaves scheduled</p>
              ) : (
                <div className="space-y-2">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(leave.leave_date), "EEEE, MMMM d, yyyy")}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {leave.leave_type === "full_day" ? "Full Day" : 
                               leave.leave_type === "half_day_morning" ? "Morning Off" : "Evening Off"}
                            </Badge>
                            {leave.reason && (
                              <span className="text-sm text-muted-foreground">{leave.reason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLeave(leave.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicDoctorSchedules;
