import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/TablePagination";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { ImprovedAppointmentCalendar } from "@/components/ImprovedAppointmentCalendar";

const DoctorReceptionistAppointments = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCalendar, setShowCalendar] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  const fetchAppointments = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (id, full_name, phone, patient_id)
        `)
        .eq("doctor_id", doctorId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
      no_show: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredAppointments = appointments.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.patients?.full_name?.toLowerCase().includes(query) ||
      a.patients?.patient_id?.toLowerCase().includes(query)
    );
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (doctorLoading || loading) {
    return <TableSkeleton columns={6} rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showCalendar ? "default" : "outline"}
            onClick={() => setShowCalendar(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={!showCalendar ? "default" : "outline"}
            onClick={() => setShowCalendar(false)}
          >
            <Clock className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {showCalendar && doctorId ? (
        <ImprovedAppointmentCalendar
          doctorId={doctorId}
          onAppointmentChange={fetchAppointments}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Appointments ({filteredAppointments.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No appointments found" : "No appointments scheduled yet"}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAppointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell className="font-medium">
                          {appt.patients?.full_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(appt.appointment_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{appt.appointment_time}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{appt.appointment_type || "new"}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(appt.status)}</TableCell>
                        <TableCell>Rs. {appt.total_fee || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={currentPage}
                  totalItems={filteredAppointments.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorReceptionistAppointments;
