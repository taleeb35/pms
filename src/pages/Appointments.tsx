import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Appointments</h2>
          <p className="text-muted-foreground">Manage patient appointments</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading appointments...</p>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No appointments scheduled</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id}>
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
      </div>
    </div>
  );
};

export default Appointments;
