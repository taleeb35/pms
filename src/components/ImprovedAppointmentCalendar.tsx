import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
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
}

export const ImprovedAppointmentCalendar = ({ 
  appointments, 
  onAppointmentClick,
  doctorId,
  doctors = []
}: ImprovedAppointmentCalendarProps) => {
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
      confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.scheduled;
  };

  // Check if selected date is unavailable
  const selectedDateUnavailable = unavailableDates.find(
    u => u.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            onMonthChange={handleMonthChange}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
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
                    className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => onAppointmentClick(apt)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{apt.patients.full_name}</h4>
                        <p className="text-sm text-muted-foreground">ID: {apt.patients.patient_id}</p>
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium">{apt.appointment_time}</span>
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
