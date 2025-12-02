import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar as CalendarIcon, Banknote } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface AppointmentRevenue {
  id: string;
  patient_name: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_fee: number;
  other_fee: number;
  total_fee: number;
}

interface Doctor {
  id: string;
  name: string;
}

export default function ClinicFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [selectedDate, selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("clinic_id", user.id);

      if (error) throw error;

      const doctorList: Doctor[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.profiles?.full_name || "Unknown Doctor",
      }));

      setDoctors(doctorList);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get doctors from this clinic
      const { data: clinicDoctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id")
        .eq("clinic_id", user.id);

      if (doctorsError) throw doctorsError;

      const doctorIds = clinicDoctors?.map(d => d.id) || [];

      if (doctorIds.length === 0) {
        setAppointments([]);
        setTotalRevenue(0);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          consultation_fee,
          other_fee,
          total_fee,
          patients(full_name, patient_id)
        `)
        .in("doctor_id", selectedDoctor !== "all" ? [selectedDoctor] : doctorIds)
        .eq("status", "completed")
        .order("appointment_time", { ascending: true });

      if (selectedDate) {
        query = query.eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;

      const appointmentData: AppointmentRevenue[] = (data || []).map((apt: any) => ({
        id: apt.id,
        patient_name: apt.patients?.full_name || "Unknown",
        patient_id: apt.patients?.patient_id || "N/A",
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        consultation_fee: Number(apt.consultation_fee) || 0,
        other_fee: Number(apt.other_fee) || 0,
        total_fee: Number(apt.total_fee) || 0,
      }));

      setAppointments(appointmentData);
      setTotalRevenue(appointmentData.reduce((sum, apt) => sum + apt.total_fee, 0));
      setCurrentPage(1);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track your revenue by date</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Banknote className="h-6 w-6" />
            Total Revenue
          </CardTitle>
          <CardDescription className="text-green-100">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            {selectedDoctor !== "all" && ` - ${doctors.find(d => d.id === selectedDoctor)?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      {/* Appointments Revenue Listing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointments Revenue</CardTitle>
              <CardDescription>
                Revenue breakdown for each appointment on {selectedDate ? format(selectedDate, "PPP") : "selected date"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed appointments found for this date.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Consultation Fee</TableHead>
                    <TableHead className="text-right">Other Fee</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{apt.patient_name}</TableCell>
                      <TableCell>{apt.patient_id}</TableCell>
                      <TableCell>{apt.appointment_time}</TableCell>
                      <TableCell className="text-right">
                        {apt.consultation_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {apt.other_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                        {apt.total_fee.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {appointments.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, appointments.length)} of {appointments.length} entries
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(appointments.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(appointments.length / itemsPerPage), p + 1))}
                          className={currentPage === Math.ceil(appointments.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
