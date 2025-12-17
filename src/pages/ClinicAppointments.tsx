import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Plus, Check, X, Edit, Search, Trash2, MoreVertical, FileText, Play, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { useClinicId } from "@/hooks/useClinicId";
import { isTimeSlotAvailable } from "@/lib/appointmentUtils";
import { TimeSelect } from "@/components/TimeSelect";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  duration_minutes: number | null;
  consultation_fee: number | null;
  other_fee: number | null;
  total_fee: number | null;
  patient_id: string;
  doctor_id: string;
  created_by: string | null;
  patients: { 
    full_name: string; 
    phone: string; 
    patient_id: string;
    date_of_birth: string;
    email: string | null;
    father_name: string | null;
    pregnancy_start_date?: string | null;
  };
  doctors: {
    profiles: {
      full_name: string;
    } | null;
    specialization: string;
  } | null;
  creator: {
    full_name: string;
  } | null;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  } | null;
  specialization: string;
}

const ClinicAppointments = () => {
  const { clinicId, isReceptionist, loading: clinicLoading } = useClinicId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedGynecologist, setSelectedGynecologist] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [editSelectedTime, setEditSelectedTime] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
    }
  }, [clinicId]);

  useEffect(() => {
    if (doctors.length > 0) {
      fetchAppointments();
      fetchPatients();
      fetchWaitlistPatients();
    }
  }, [doctors]);

  const fetchDoctors = async () => {
    if (!clinicId) return;
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, specialization, profiles(full_name)")
        .eq("clinic_id", clinicId)
        .order("profiles(full_name)");

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching doctors", description: error.message, variant: "destructive" });
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *, 
          patients(full_name, phone, patient_id, date_of_birth, email, father_name, pregnancy_start_date),
          doctors(profiles(full_name), specialization),
          creator:profiles!appointments_created_by_fkey(full_name)
        `)
        .in("doctor_id", doctors.map(d => d.id))
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching appointments", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all patients for doctors in this clinic
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_id, full_name, phone, created_by")
        .in("created_by", doctors.map(d => d.id))
        .order("full_name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching patients", description: error.message, variant: "destructive" });
    }
  };

  const fetchWaitlistPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wait_list")
        .select("patient_id")
        .in("doctor_id", doctors.map(d => d.id))
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
    if (!selectedDoctorId) {
      toast({ title: "Error", description: "Please select a doctor", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const appointmentDate = format(selectedDate, "yyyy-MM-dd");
      const appointmentTime = selectedTime;

      // Check for double booking
      const { available, error: slotError } = await isTimeSlotAvailable(
        selectedDoctorId,
        appointmentDate,
        appointmentTime
      );

      if (!available) {
        toast({ 
          title: "Time Slot Unavailable", 
          description: "This doctor already has an appointment at this time. Please select a different time slot.", 
          variant: "destructive" 
        });
        return;
      }

      const { error } = await supabase.from("appointments").insert({
        doctor_id: selectedDoctorId,
        patient_id: selectedPatientId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration_minutes: parseInt(formData.get("duration_minutes") as string),
        reason: formData.get("reason") as string || null,
        notes: formData.get("notes") as string || null,
        status: "scheduled" as const,
        created_by: user?.id || null,
      });

      if (error) throw error;

      // Remove patient from waitlist if they were in it
      await supabase
        .from("wait_list")
        .delete()
        .eq("doctor_id", selectedDoctorId)
        .eq("patient_id", selectedPatientId)
        .eq("status", "active");

      toast({ title: "Success", description: "Appointment created successfully" });
      setShowAddDialog(false);
      setSelectedDate(undefined);
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setSelectedTime("");
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
    const newDoctorId = formData.get("doctor_id") as string;
    const appointmentDate = format(editDate, "yyyy-MM-dd");
    const appointmentTime = editSelectedTime;
    
    try {
      // Check for double booking (exclude current appointment)
      const { available } = await isTimeSlotAvailable(
        newDoctorId,
        appointmentDate,
        appointmentTime,
        editingAppointment.id
      );

      if (!available) {
        toast({ 
          title: "Time Slot Unavailable", 
          description: "This doctor already has an appointment at this time. Please select a different time slot.", 
          variant: "destructive" 
        });
        return;
      }

      const { error } = await supabase.from("appointments").update({
        doctor_id: newDoctorId,
        patient_id: formData.get("patient_id") as string,
        appointment_date: appointmentDate, 
        appointment_time: appointmentTime,
        duration_minutes: parseInt(formData.get("duration_minutes") as string), 
        reason: formData.get("reason") as string || null,
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
    setEditSelectedTime(appointment.appointment_time?.slice(0, 5) || "");
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
        apt.patients.patient_id?.toLowerCase().includes(query) ||
        apt.doctors?.profiles?.full_name?.toLowerCase().includes(query)
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
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />New Appointment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Create a new appointment for a patient</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={selectedDoctorId} onValueChange={(value) => {
                  setSelectedDoctorId(value);
                  const doctor = doctors.find(d => d.id === value);
                  setSelectedGynecologist(doctor?.specialization?.toLowerCase().includes("gynecologist") ? value : null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.profiles?.full_name || "Unknown Doctor"} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={(date) => { setSelectedDate(date); if (date) setDatePopoverOpen(false); }} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_time">Time</Label>
                  <TimeSelect value={selectedTime} onValueChange={setSelectedTime} name="appointment_time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={30} min={15} step={15} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input id="reason" name="reason" placeholder="e.g., Regular checkup" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Additional notes..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit">Create Appointment</Button>
              </div>
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
              placeholder="Search by patient or doctor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>All Appointments</CardTitle></CardHeader>
            <CardContent>
              {paginatedAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAppointments.map((apt) => (
                      <TableRow key={apt.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">{apt.doctors?.profiles?.full_name || "Unknown Doctor"}</TableCell>
                        <TableCell className="font-medium">{apt.patients.full_name}</TableCell>
                        <TableCell>{apt.patients.phone}</TableCell>
                        <TableCell>
                          {format(new Date(apt.appointment_date), "PPP")}
                          <br />
                          <span className="text-sm text-muted-foreground">{apt.appointment_time}</span>
                        </TableCell>
                        <TableCell>{apt.creator?.full_name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background z-50">
                              <DropdownMenuItem onClick={() => openEditDialog(apt)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openVisitDialog(apt)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Record Visit
                              </DropdownMenuItem>
                              {apt.status === "scheduled" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "confirmed")}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Confirm
                                </DropdownMenuItem>
                              )}
                              {apt.status === "confirmed" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "in_progress")}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </DropdownMenuItem>
                              )}
                              {apt.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "completed")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </DropdownMenuItem>
                              )}
                              {(apt.status === "scheduled" || apt.status === "confirmed") && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(apt.id, "cancelled")}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{[25, 50, 75, 100].map(size => <SelectItem key={size} value={size.toString()}>{size}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <ImprovedAppointmentCalendar appointments={appointments} onAppointmentClick={openVisitDialog} />
        </TabsContent>
      </Tabs>

      {showEditDialog && editingAppointment && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Appointment</DialogTitle></DialogHeader>
            <form onSubmit={handleEditAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Select name="doctor_id" defaultValue={editingAppointment.doctor_id} required>
                    <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.profiles?.full_name || "Unknown"} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select name="patient_id" defaultValue={editingAppointment.patient_id} required>
                    <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name} ({patient.patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Popover open={editDatePopoverOpen} onOpenChange={setEditDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={editDate} onSelect={(date) => { setEditDate(date); if (date) setEditDatePopoverOpen(false); }} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_appointment_time">Time</Label>
                  <TimeSelect value={editSelectedTime} onValueChange={setEditSelectedTime} name="appointment_time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_duration_minutes">Duration (minutes)</Label>
                <Input id="edit_duration_minutes" name="duration_minutes" type="number" defaultValue={editingAppointment.duration_minutes || 30} min={15} step={15} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_reason">Reason for Visit</Label>
                <Input id="edit_reason" name="reason" defaultValue={editingAppointment.reason || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea id="edit_notes" name="notes" defaultValue={editingAppointment.notes || ""} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button type="submit">Update Appointment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showVisitDialog && visitAppointment && (
        <VisitRecordDialog
          appointment={visitAppointment}
          open={showVisitDialog}
          onOpenChange={(open) => {
            setShowVisitDialog(open);
            if (!open) fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default ClinicAppointments;
