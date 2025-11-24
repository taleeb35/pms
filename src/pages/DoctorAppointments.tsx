import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Plus, Check, X, Clock, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { ImprovedAppointmentCalendar } from "@/components/ImprovedAppointmentCalendar";
import { VisitRecordDialog } from "@/components/VisitRecordDialog";
import { PatientSearchSelect } from "@/components/PatientSearchSelect";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  duration_minutes: number | null;
  patient_id: string;
  patients: { 
    full_name: string; 
    phone: string; 
    patient_id: string;
    date_of_birth: string;
  };
}

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistPatientIds, setWaitlistPatientIds] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [visitAppointment, setVisitAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState<Date>();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [editDatePopoverOpen, setEditDatePopoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const { toast } = useToast();

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchWaitlistPatients();
  }, [dateFilter]);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("appointments").select(`*, patients(full_name, phone, patient_id, date_of_birth)`).eq("doctor_id", user.id).order("appointment_date", { ascending: true }).order("appointment_time", { ascending: true });
      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching appointments", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("id, patient_id, full_name, phone").order("full_name");
    setPatients(data || []);
  };

  const fetchWaitlistPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wait_list")
        .select("patient_id")
        .eq("doctor_id", user.id)
        .eq("status", "active");

      if (error) throw error;
      const ids = new Set((data || []).map(item => item.patient_id));
      setWaitlistPatientIds(ids);
    } catch (error: any) {
      console.error("Error fetching waitlist:", error);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedDate) {
      toast({ title: "Error", description: "Please select an appointment date", variant: "destructive" });
      return;
    }
    if (!selectedPatientId) {
      toast({ title: "Error", description: "Please select a patient", variant: "destructive" });
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const patientId = selectedPatientId;
      
      const { error } = await supabase.from("appointments").insert({
        doctor_id: user?.id, patient_id: patientId,
        appointment_date: format(selectedDate, "yyyy-MM-dd"), appointment_time: formData.get("appointment_time") as string,
        duration_minutes: parseInt(formData.get("duration_minutes") as string), reason: formData.get("reason") as string || null,
        notes: formData.get("notes") as string || null, status: "scheduled" as const,
      });
      if (error) throw error;

      // Remove patient from waitlist if they were in it
      await supabase
        .from("wait_list")
        .delete()
        .eq("doctor_id", user?.id)
        .eq("patient_id", patientId)
        .eq("status", "active");

      toast({ title: "Success", description: "Appointment created successfully" });
      setShowAddDialog(false);
      setSelectedDate(undefined);
      setSelectedPatientId("");
      fetchAppointments();
      fetchWaitlistPatients();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ title: "Error creating appointment", description: error.message, variant: "destructive" });
    }
  };

  const handleEditAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAppointment || !editDate) return;
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.from("appointments").update({
        appointment_date: format(editDate, "yyyy-MM-dd"), appointment_time: formData.get("appointment_time") as string,
        duration_minutes: parseInt(formData.get("duration_minutes") as string), reason: formData.get("reason") as string || null,
        notes: formData.get("notes") as string || null,
      }).eq("id", editingAppointment.id);
      if (error) throw error;
      toast({ title: "Success", description: "Appointment updated successfully" });
      setShowEditDialog(false);
      setEditingAppointment(null);
      setEditDate(undefined);
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "Error updating appointment", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus as any }).eq("id", appointmentId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Appointment status updated" });
    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      in_progress: { label: "In Progress", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      completed: { label: "Completed", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    };
    const c = config[status] || config.scheduled;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditDate(new Date(appointment.appointment_date));
    setShowEditDialog(true);
  };

  const openVisitDialog = (appointment: Appointment) => {
    setVisitAppointment(appointment);
    setShowVisitDialog(true);
  };

  const getFilteredAppointments = () => {
    if (!dateFilter || dateFilter === "all") return appointments;
    const today = startOfDay(new Date());
    switch (dateFilter) {
      case "today":
        return appointments.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: today, end: endOfDay(today) }));
      case "tomorrow":
        const tomorrow = addDays(today, 1);
        return appointments.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: tomorrow, end: endOfDay(tomorrow) }));
      case "day_after":
        const dayAfter = addDays(today, 2);
        return appointments.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: dayAfter, end: endOfDay(dayAfter) }));
      case "week":
        const weekEnd = addDays(today, 7);
        return appointments.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: today, end: weekEnd }));
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />New Appointment</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Schedule New Appointment</DialogTitle><DialogDescription>Create a new appointment for a patient</DialogDescription></DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <PatientSearchSelect
                  patients={patients}
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                  placeholder="Search by name, phone, or ID..."
                  waitlistPatientIds={waitlistPatientIds}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Appointment Date</Label><Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={selectedDate} onSelect={(date) => { setSelectedDate(date); if (date) setDatePopoverOpen(false); }} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus /></PopoverContent></Popover></div>
                <div className="space-y-2"><Label htmlFor="appointment_time">Time</Label><Select name="appointment_time" required><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger><SelectContent>{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="duration_minutes">Duration (minutes)</Label><Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={30} min={15} step={15} required /></div>
              <div className="space-y-2"><Label htmlFor="reason">Reason for Visit</Label><Input id="reason" name="reason" placeholder="e.g., Regular checkup" /></div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="Additional notes..." rows={3} /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button type="submit">Create Appointment</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="table">Table View</TabsTrigger><TabsTrigger value="calendar">Calendar View</TabsTrigger></TabsList>
        <TabsContent value="table" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Select value={dateFilter || "all"} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="day_after">Day After Tomorrow</SelectItem>
                <SelectItem value="week">Within 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card><CardHeader><CardTitle>All Appointments</CardTitle></CardHeader><CardContent>
            {paginatedAppointments.length === 0 ? <p className="text-center text-muted-foreground py-8">No appointments scheduled</p> : (
              <Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Patient ID</TableHead><TableHead>Patient Phone</TableHead><TableHead>Date & Time</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{paginatedAppointments.map((apt) => (
                <TableRow key={apt.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{apt.patients.full_name}</TableCell>
                  <TableCell>{apt.patients.patient_id}</TableCell>
                  <TableCell>{apt.patients.phone}</TableCell>
                  <TableCell>{format(new Date(apt.appointment_date), "PPP")}<br /><span className="text-sm text-muted-foreground">{apt.appointment_time}</span></TableCell>
                  <TableCell>{apt.reason || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell><div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openVisitDialog(apt)} title="Record Visit"><Edit className="h-4 w-4" /></Button>
                    {apt.status === "scheduled" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, "confirmed")}>Confirm</Button>}
                    {apt.status === "confirmed" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, "in_progress")}>Start</Button>}
                    {apt.status === "in_progress" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, "completed")}>Complete</Button>}
                    {(apt.status === "scheduled" || apt.status === "confirmed") && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, "cancelled")}>Cancel</Button>}
                  </div></TableCell>
                </TableRow>
              ))}</TableBody></Table>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="75">75</SelectItem><SelectItem value="100">100</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="text-sm py-2">Page {currentPage} of {totalPages || 1}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</Button>
              </div>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="calendar">
          <ImprovedAppointmentCalendar 
            appointments={appointments} 
            onAppointmentClick={openVisitDialog} 
          />
        </TabsContent>
      </Tabs>

      <VisitRecordDialog
        open={showVisitDialog}
        onOpenChange={setShowVisitDialog}
        appointment={visitAppointment}
      />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Appointment</DialogTitle><DialogDescription>Update appointment details for {editingAppointment?.patients.full_name}</DialogDescription></DialogHeader>
          {editingAppointment && (
            <form onSubmit={handleEditAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Appointment Date</Label><Popover open={editDatePopoverOpen} onOpenChange={setEditDatePopoverOpen}><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{editDate ? format(editDate, "PPP") : "Pick a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={editDate} onSelect={(date) => { setEditDate(date); if (date) setEditDatePopoverOpen(false); }} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus /></PopoverContent></Popover></div>
                <div className="space-y-2"><Label>Time</Label><Select name="appointment_time" defaultValue={editingAppointment.appointment_time} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="edit_duration_minutes">Duration (minutes)</Label><Input id="edit_duration_minutes" name="duration_minutes" type="number" defaultValue={editingAppointment.duration_minutes || 30} min={15} step={15} required /></div>
              <div className="space-y-2"><Label htmlFor="edit_reason">Reason for Visit</Label><Input id="edit_reason" name="reason" defaultValue={editingAppointment.reason || ""} placeholder="e.g., Regular checkup" /></div>
              <div className="space-y-2"><Label htmlFor="edit_notes">Notes</Label><Textarea id="edit_notes" name="notes" defaultValue={editingAppointment.notes || ""} placeholder="Additional notes..." rows={3} /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setShowEditDialog(false); setEditingAppointment(null); setEditDate(undefined); }}>Cancel</Button><Button type="submit">Update Appointment</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorAppointments;
