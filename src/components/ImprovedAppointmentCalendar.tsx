import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  patients: { full_name: string; phone: string; patient_id: string };
}

interface ImprovedAppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export const ImprovedAppointmentCalendar = ({ appointments, onAppointmentClick }: ImprovedAppointmentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const modifiers = {
    hasAppointments: Object.keys(datesWithAppointments).map(dateStr => new Date(dateStr))
  };

  const modifiersClassNames = {
    hasAppointments: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              Dates with appointments are marked with a dot. Select a date to view appointments.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Appointments on {format(selectedDate, "MMMM do, yyyy")}
          </h3>
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
