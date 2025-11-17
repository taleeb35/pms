import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  reason: string | null;
  notes: string | null;
  patients: { id: string; patient_id: string; full_name: string; phone: string };
  doctors: { id: string; profiles: { full_name: string }; specialization: string };
  created_at: string;
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(id, patient_id, full_name, phone),
          doctors(id, specialization, profiles(full_name))
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setAppointment(data);
    } catch (error: any) {
      toast({
        title: "Error fetching appointment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Appointment status updated",
      });

      fetchAppointment();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Appointment cancelled successfully",
      });

      navigate("/appointments");
    } catch (error: any) {
      toast({
        title: "Error cancelling appointment",
        description: error.message,
        variant: "destructive",
      });
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

  if (loading) {
    return <div>Loading appointment details...</div>;
  }

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Appointment Details</h2>
            <p className="text-muted-foreground">
              {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/appointments/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Yes, cancel appointment</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{appointment.patients.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
              <p>{appointment.patients.patient_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{appointment.patients.phone}</p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate(`/patients/${appointment.patients.id}`)}
            >
              View Patient Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{appointment.doctors.profiles.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Specialization</p>
              <p>{appointment.doctors.specialization}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{new Date(appointment.appointment_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p>{appointment.appointment_time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p>{appointment.duration_minutes} minutes</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-3">
              <Select
                value={appointment.status}
                onValueChange={handleStatusChange}
                disabled={statusLoading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {appointment.reason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Visit</p>
              <p>{appointment.reason}</p>
            </div>
          )}

          {appointment.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
              <p>{appointment.notes}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Created</p>
            <p className="text-sm">{new Date(appointment.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentDetail;
