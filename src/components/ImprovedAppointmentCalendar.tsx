import { useState, useEffect } from "react";
import { friendlyDate, friendlyTime } from "@/lib/datetime";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { isTimeSlotAvailable } from "@/lib/appointmentUtils";
import { logActivity } from "@/lib/activityLogger";
import { useToast } from "@/hooks/use-toast";
import { zonedNow } from "@/lib/region";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  doctor_id?: string;
  patients: { full_name: string; phone: string; patient_id: string };
}

interface DoctorInfo {
  id: string;
  name?: string;
}

interface UnavailableDate {
  date: string;
  type: 'leave' | 'day_off';
  reason?: string;
}

interface ImprovedAppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  doctorId?: string; // For single doctor view (doctor dashboard)
  doctors?: DoctorInfo[]; // For multi-doctor view (clinic/receptionist dashboard)
  onRescheduled?: () => void; // called after an appointment is dragged to another day
}

export const ImprovedAppointmentCalendar = ({ 
  appointments, 
  onAppointmentClick,
  doctorId,
  doctors = [],
  onRescheduled,
}: ImprovedAppointmentCalendarProps) => {
  const { toast } = useToast();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  // Fetch unavailable dates (leaves and off days) when month changes or doctor changes
  useEffect(() => {
    fetchUnavailableDates();
  }, [currentMonth, doctorId, doctors]);

  const fetchUnavailableDates = async () => {
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Get the doctor IDs to check
      const doctorIds = doctorId ? [doctorId] : doctors.map(d => d.id);
      
      if (doctorIds.length === 0) return;

      const unavailable: UnavailableDate[] = [];

      // Fetch leaves for all relevant doctors in the current month
      const { data: leaves, error: leavesError } = await supabase
        .from("doctor_leaves")
        .select("doctor_id, leave_date, leave_type, reason")
        .in("doctor_id", doctorIds)
        .gte("leave_date", format(monthStart, "yyyy-MM-dd"))
        .lte("leave_date", format(monthEnd, "yyyy-MM-dd"));

      if (leavesError) {
        console.error("Error fetching leaves:", leavesError);
      } else if (leaves) {
        leaves.forEach(leave => {
          if (leave.leave_type === "full_day") {
            unavailable.push({
              date: leave.leave_date,
              type: 'leave',
              reason: leave.reason || 'On Leave'
            });
          }
        });
      }

      // Fetch schedules for all relevant doctors
      const { data: schedules, error: schedulesError } = await supabase
        .from("doctor_schedules")
        .select("doctor_id, day_of_week, is_available")
        .in("doctor_id", doctorIds)
        .eq("is_available", false);

      if (schedulesError) {
        console.error("Error fetching schedules:", schedulesError);
      } else if (schedules) {
        // Create a set of unavailable days of week per doctor
        const unavailableDaysPerDoctor = new Map<string, Set<number>>();
        schedules.forEach(schedule => {
          if (!unavailableDaysPerDoctor.has(schedule.doctor_id)) {
            unavailableDaysPerDoctor.set(schedule.doctor_id, new Set());
          }
          unavailableDaysPerDoctor.get(schedule.doctor_id)?.add(schedule.day_of_week);
        });

        // For single doctor view, mark off days
        if (doctorId && unavailableDaysPerDoctor.has(doctorId)) {
          const offDays = unavailableDaysPerDoctor.get(doctorId)!;
          allDaysInMonth.forEach(day => {
            const dayOfWeek = day.getDay();
            if (offDays.has(dayOfWeek)) {
              const dateStr = format(day, "yyyy-MM-dd");
              // Don't duplicate if already marked as leave
              if (!unavailable.find(u => u.date === dateStr)) {
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                unavailable.push({
                  date: dateStr,
                  type: 'day_off',
                  reason: `${dayNames[dayOfWeek]} Off`
                });
              }
            }
          });
        }

        // For multi-doctor view, only mark a date as off if ALL doctors are off
        if (!doctorId && doctors.length > 0) {
          allDaysInMonth.forEach(day => {
            const dayOfWeek = day.getDay();
            const dateStr = format(day, "yyyy-MM-dd");
            
            // Check if this date is already marked as leave for any doctor
            const hasLeave = leaves?.some(l => l.leave_date === dateStr && l.leave_type === "full_day");
            
            // Check if all doctors are off on this day
            const allDoctorsOff = doctors.every(doctor => {
              const doctorOffDays = unavailableDaysPerDoctor.get(doctor.id);
              return doctorOffDays?.has(dayOfWeek);
            });
            
            if (allDoctorsOff && !hasLeave) {
              const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              unavailable.push({
                date: dateStr,
                type: 'day_off',
                reason: `All doctors off on ${dayNames[dayOfWeek]}`
              });
            }
          });
        }
      }

      setUnavailableDates(unavailable);
    } catch (error) {
      console.error("Error fetching unavailable dates:", error);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  // Get appointments count for each date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  // Get appointments for selected date
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  // Create modifiers for dates with appointments
  const datesWithAppointments = appointments.reduce((acc, apt) => {
    const date = new Date(apt.appointment_date);
    const dateStr = format(date, "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Create sets for different modifiers
  const leaveDates = unavailableDates
    .filter(u => u.type === 'leave')
    .map(u => {
      const [year, month, day] = u.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    });

  const dayOffDates = unavailableDates
    .filter(u => u.type === 'day_off')
    .map(u => {
      const [year, month, day] = u.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    });

  const modifiers = {
    hasAppointments: Object.keys(datesWithAppointments).map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }),
    onLeave: leaveDates,
    dayOff: dayOffDates
  };

  const modifiersClassNames = {
    hasAppointments: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary",
    onLeave: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through",
    dayOff: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      start: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.scheduled;
  };

  // Check if selected date is unavailable
  const selectedDateUnavailable = unavailableDates.find(
    u => u.date === format(selectedDate, "yyyy-MM-dd")
  );

  // Drag a booked appointment from the list onto another day to move it (same time, same doctor).
  const dayFromEvent = (e: React.DragEvent) => {
    const btn = (e.target as HTMLElement).closest("button");
    return btn?.querySelector("[data-day]")?.getAttribute("data-day") || null;
  };
  const moveTo = async (aptId: string, newDate: string) => {
    const apt = appointments.find((a) => a.id === aptId);
    if (!apt || apt.appointment_date === newDate) return;
    if (newDate < zonedNow().ymd) { toast({ title: "Pick today or a later day", variant: "destructive" }); return; }
    const off = unavailableDates.find((u) => u.date === newDate);
    if (off && (doctorId || doctors.length === 1)) { toast({ title: "Doctor is not available that day", description: off.reason, variant: "destructive" }); return; }
    const docId = apt.doctor_id || doctorId;
    if (!docId) return;
    const { available } = await isTimeSlotAvailable(docId, newDate, apt.appointment_time, apt.id);
    if (!available) { toast({ title: "That time is already booked", description: `${friendlyTime(apt.appointment_time)} on ${friendlyDate(newDate)} is taken. Open the appointment to pick another time.`, variant: "destructive" }); return; }
    const oldDate = apt.appointment_date;
    const { error } = await supabase.from("appointments").update({ appointment_date: newDate }).eq("id", apt.id);
    if (error) { toast({ title: "Could not move", description: error.message, variant: "destructive" }); return; }
    logActivity({ action: "appointment_updated", entityType: "appointment", entityId: apt.id, details: { field: "appointment_date", patient_name: apt.patients.full_name, old_value: oldDate, new_value: newDate } });
    const [y, m, d] = newDate.split("-").map(Number);
    setSelectedDate(new Date(y, m - 1, d));
    onRescheduled?.();
    toast({ title: "Appointment moved", description: `${apt.patients.full_name}: ${friendlyDate(newDate)} at ${friendlyTime(apt.appointment_time)}` });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <div
            onDragOver={(e) => { if (!dragId) return; const d = dayFromEvent(e); if (d) { e.preventDefault(); setDropDay(d); } }}
            onDragLeave={() => setDropDay(null)}
            onDrop={(e) => { e.preventDefault(); const d = dayFromEvent(e); const id = e.dataTransfer.getData("text/appointment-id") || dragId; setDropDay(null); setDragId(null); if (d && id) moveTo(id, d); }}
          >
          <Calendar
            components={{
              IconLeft: () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
              DayContent: ({ date }) => {
                const key = format(date, "yyyy-MM-dd");
                return <span data-day={key} className={cn(dropDay === key && "rounded ring-2 ring-primary ring-offset-1")}>{date.getDate()}</span>;
              },
            }}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={handleMonthChange}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
          </div>
          {dragId && <p className="mt-2 text-xs font-medium text-primary">Drop on a day to move the appointment.</p>}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-muted-foreground">Has Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300"></div>
                <span className="text-muted-foreground">On Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-300"></div>
                <span className="text-muted-foreground">Day Off</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Appointments on {format(selectedDate, "MMMM do, yyyy")}
          </h3>
          {selectedDateAppointments.some((a) => a.status === "scheduled") && <p className="-mt-3 mb-3 hidden text-xs text-muted-foreground lg:block">Tip: drag a booked appointment onto another day to move it.</p>}
          
          {selectedDateUnavailable && (
            <div className={cn(
              "mb-4 p-3 rounded-md text-sm font-medium",
              selectedDateUnavailable.type === 'leave' 
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" 
                : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
            )}>
              ⚠️ {selectedDateUnavailable.reason}
            </div>
          )}
          
          {selectedDateAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((apt) => (
                  <div
                    key={apt.id}
                    draggable={apt.status === "scheduled"}
                    onDragStart={(e) => { e.dataTransfer.setData("text/appointment-id", apt.id); e.dataTransfer.effectAllowed = "move"; setDragId(apt.id); }}
                    onDragEnd={() => { setDragId(null); setDropDay(null); }}
                    className={cn("p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors", apt.status === "scheduled" && "active:cursor-grabbing", dragId === apt.id && "opacity-50")}
                    onClick={() => onAppointmentClick(apt)}
                    title={apt.status === "scheduled" ? "Drag onto a day in the calendar to move" : undefined}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-1">{apt.status === "scheduled" && <GripVertical className="h-4 w-4 text-muted-foreground hidden lg:inline" />}{apt.patients.full_name}</h4>
                        <p className="text-sm text-muted-foreground">ID: {apt.patients.patient_id}</p>
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">{friendlyTime(apt.appointment_time)}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{apt.reason || "General checkup"}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
