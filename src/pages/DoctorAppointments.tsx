import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Plus, Check, X, Clock, Edit, Search, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
import { calculatePregnancyDuration } from "@/lib/pregnancyUtils";

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
    email: string | null;
    father_name: string | null;
    pregnancy_start_date?: string | null;
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
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("scheduled");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isGynecologist, setIsGynecologist] = useState(false);
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
    checkDoctorSpecialization();
  }, []);

  const checkDoctorSpecialization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctors")
        .select("specialization")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setIsGynecologist(data?.specialization?.toLowerCase().includes("gynecologist") || false);
    } catch (error) {
      console.error("Error checking doctor specialization:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("appointments").select(`*, patients(full_name, phone, patient_id, date_of_birth, email, father_name, pregnancy_start_date)`).eq("doctor_id", user.id).order("appointment_date", { ascending: true }).order("appointment_time", { ascending: true });
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
        notes: formData.get("notes") as string || null, 
        status: "scheduled" as const,
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

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", appointmentId);
      if (error) throw error;
      toast({ title: "Success", description: "Appointment deleted successfully" });
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "Error deleting appointment", description: error.message, variant: "destructive" });
    }
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
    let filtered = appointments;
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter && dateFilter !== "all") {
      const today = startOfDay(new Date());
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: today, end: endOfDay(today) }));
          break;
        case "tomorrow":
          const tomorrow = addDays(today, 1);
          filtered = filtered.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: tomorrow, end: endOfDay(tomorrow) }));
          break;
        case "day_after":
          const dayAfter = addDays(today, 2);
          filtered = filtered.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: dayAfter, end: endOfDay(dayAfter) }));
          break;
        case "week":
          const weekEnd = addDays(today, 7);
          filtered = filtered.filter(apt => isWithinInterval(new Date(apt.appointment_date), { start: today, end: weekEnd }));
          break;
      }
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(apt => 
        apt.patients.full_name?.toLowerCase().includes(query) ||
        apt.patients.father_name?.toLowerCase().includes(query) ||
        apt.patients.phone?.toLowerCase().includes(query) ||
        apt.patients.email?.toLowerCase().includes(query) ||
        apt.patients.patient_id?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
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
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-accent/50 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="table" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Table View
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
            >
              Calendar View
            </TabsTrigger>
          </TabsList>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter || "all"} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="day_after">Day After Tomorrow</SelectItem>
              <SelectItem value="week">Within 7 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, father name, phone, email, or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
        <TabsContent value="table" className="space-y-4">
          <Card><CardHeader><CardTitle>All Appointments</CardTitle></CardHeader><CardContent>
            {paginatedAppointments.length === 0 ? <p className="text-center text-muted-foreground py-8">No appointments scheduled</p> : (
              <Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Patient ID</TableHead><TableHead>Father Name</TableHead><TableHead>DOB</TableHead><TableHead>Patient Phone</TableHead>{isGynecologist && <TableHead>Pregnancy</TableHead>}<TableHead>Date & Time</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>{paginatedAppointments.map((apt) => (
                <TableRow key={apt.id} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{apt.patients.full_name}</TableCell>
                  <TableCell>{apt.patients.patient_id}</TableCell>
                  <TableCell>{apt.patients.father_name || "-"}</TableCell>
                  <TableCell>{apt.patients.date_of_birth ? format(new Date(apt.patients.date_of_birth), "PP") : "-"}</TableCell>
                  <TableCell>{apt.patients.phone}</TableCell>
                  {isGynecologist && (
                    <TableCell>
                      {apt.patients.pregnancy_start_date ? (
                        <span className="text-primary font-medium">
                          {calculatePregnancyDuration(apt.patients.pregnancy_start_date)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{format(new Date(apt.appointment_date), "PPP")}<br /><span className="text-sm text-muted-foreground">{apt.appointment_time}</span></TableCell>
                  <TableCell>{apt.reason || <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell><div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openVisitDialog(apt)} 
                      title="Record Visit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {apt.status === "scheduled" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                      >
                        Confirm
                      </Button>
                    )}
                    {apt.status === "confirmed" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(apt.id, "in_progress")}
                        disabled={false}
                      >
                        Start
                      </Button>
                    )}
                    {apt.status === "in_progress" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(apt.id, "completed")}
                        disabled={false}
                      >
                        Complete
                      </Button>
                    )}
                    {(apt.status === "scheduled" || apt.status === "confirmed") && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this appointment for {apt.patients.full_name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAppointment(apt.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
