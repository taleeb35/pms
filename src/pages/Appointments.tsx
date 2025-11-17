import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  patients: { full_name: string };
  doctors: { profiles: { full_name: string } };
}

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(full_name),
          doctors(profiles(full_name))
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-500",
      confirmed: "bg-green-500",
      in_progress: "bg-yellow-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
      no_show: "bg-orange-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const filteredAppointments = filterStatus === "all"
    ? appointments
    : appointments.filter(apt => apt.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Appointments</h2>
          <p className="text-muted-foreground">Manage patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/appointments/calendar")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
          <Button onClick={() => navigate("/appointments/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {appointment.patients.full_name}
                    </CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                        {appointment.appointment_time}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Doctor: </span>
                      <span>{appointment.doctors.profiles.full_name}</span>
                    </div>
                    {appointment.reason && (
                      <div>
                        <span className="text-muted-foreground">Reason: </span>
                        <span>{appointment.reason}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : filteredAppointments.filter(apt =>
              new Date(apt.appointment_date).toDateString() === new Date().toDateString()
            ).length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No appointments today</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.filter(apt =>
              new Date(apt.appointment_date).toDateString() === new Date().toDateString()
            ).map((appointment) => (
              <Card key={appointment.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {appointment.patients.full_name}
                    </CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                        {appointment.appointment_time}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Doctor: </span>
                      <span>{appointment.doctors.profiles.full_name}</span>
                    </div>
                    {appointment.reason && (
                      <div>
                        <span className="text-muted-foreground">Reason: </span>
                        <span>{appointment.reason}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : filteredAppointments.filter(apt =>
              new Date(apt.appointment_date) > new Date()
            ).length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.filter(apt =>
              new Date(apt.appointment_date) > new Date()
            ).map((appointment) => (
              <Card key={appointment.id} className="cursor-pointer hover:bg-accent" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {appointment.patients.full_name}
                    </CardTitle>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleDateString()} at{" "}
                        {appointment.appointment_time}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Doctor: </span>
                      <span>{appointment.doctors.profiles.full_name}</span>
                    </div>
                    {appointment.reason && (
                      <div>
                        <span className="text-muted-foreground">Reason: </span>
                        <span>{appointment.reason}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;
