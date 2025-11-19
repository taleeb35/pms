import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, parseISO } from "date-fns";
import { useState } from "react";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  patients: {
    full_name: string;
    patient_id: string;
  };
}

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export const AppointmentCalendarView = ({ appointments, onAppointmentClick }: AppointmentCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const appointmentsOnSelectedDate = appointments.filter(apt => 
    isSameDay(parseISO(apt.appointment_date), selectedDate)
  );

  const datesWithAppointments = appointments.map(apt => parseISO(apt.appointment_date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "completed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasAppointment: datesWithAppointments
            }}
            modifiersClassNames={{
              hasAppointment: "bg-primary/20 font-bold"
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Appointments on {format(selectedDate, "PPP")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentsOnSelectedDate.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No appointments scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {appointmentsOnSelectedDate
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{apt.patients.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {apt.patients.patient_id}
                        </p>
                      </div>
                      <Badge className={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{apt.appointment_time}</span>
                      {apt.reason && (
                        <span className="text-muted-foreground">• {apt.reason}</span>
                      )}
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