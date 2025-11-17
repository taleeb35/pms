import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface Doctor {
  id: string;
  profiles: { full_name: string };
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  patients: { full_name: string };
  doctors: { id: string };
}

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchAppointments();
    }
  }, [selectedDoctor, selectedDate, view]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .order("profiles(full_name)");

      if (error) throw error;
      setDoctors(data || []);
      if (data && data.length > 0) {
        setSelectedDoctor(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching doctors",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (view === "day") {
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (view === "week") {
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
      } else {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      }

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(full_name),
          doctors(id)
        `)
        .eq("doctor_id", selectedDoctor)
        .gte("appointment_date", format(startDate, "yyyy-MM-dd"))
        .lte("appointment_date", format(endDate, "yyyy-MM-dd"))
        .order("appointment_date")
        .order("appointment_time");

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching appointments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.appointment_date), date)
    );
  };

  const navigateDate = (direction: "prev" | "next") => {
    const change = direction === "next" ? 1 : -1;
    if (view === "day") {
      setSelectedDate(addDays(selectedDate, change));
    } else if (view === "week") {
      setSelectedDate(addDays(selectedDate, change * 7));
    } else {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + change);
      setSelectedDate(newDate);
    }
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {dayAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((apt) => (
                <Card key={apt.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/appointments/${apt.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{apt.appointment_time}</p>
                          <Badge variant="secondary">{apt.status}</Badge>
                        </div>
                        <p className="text-sm font-semibold">{apt.patients.full_name}</p>
                        {apt.reason && <p className="text-sm text-muted-foreground">{apt.reason}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDate(day);
          return (
            <Card key={day.toISOString()} className={isSameDay(day, new Date()) ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{format(day, "EEE d")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2 bg-accent rounded cursor-pointer hover:bg-accent/80 text-xs"
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                  >
                    <p className="font-medium">{apt.appointment_time}</p>
                    <p className="truncate">{apt.patients.full_name}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              hasAppointments: (date) => getAppointmentsForDate(date).length > 0,
            }}
            modifiersClassNames={{
              hasAppointments: "bg-primary/10 font-bold",
            }}
          />
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">
              Appointments for {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments</p>
            ) : (
              <div className="space-y-2">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-2 bg-accent rounded cursor-pointer hover:bg-accent/80"
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{apt.patients.full_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                      </div>
                      <Badge variant="secondary">{apt.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Appointment Calendar</h2>
          <p className="text-muted-foreground">View appointments by doctor</p>
        </div>
        <Button onClick={() => navigate("/appointments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.profiles.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedDoctorData && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">
              <span className="font-medium">Viewing appointments for:</span> {selectedDoctorData.profiles.full_name}
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading appointments...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
          {view === "month" && renderMonthView()}
        </>
      )}
    </div>
  );
};

export default AppointmentCalendar;
