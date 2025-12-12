import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar as CalendarIcon, Banknote, Building2, Stethoscope, X } from "lucide-react";
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
  doctor_id: string;
  clinic_percentage: number;
}

interface Doctor {
  id: string;
  name: string;
  clinic_percentage: number;
}

export default function ClinicFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [clinicShare, setClinicShare] = useState(0);
  const [doctorsShare, setDoctorsShare] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [selectedDate, selectedDoctor, doctors]);

  const fetchDoctors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctors")
        .select("id, clinic_percentage, profiles(full_name)")
        .eq("clinic_id", user.id);

      if (error) throw error;

      const doctorList: Doctor[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.profiles?.full_name || "Unknown Doctor",
        clinic_percentage: doc.clinic_percentage || 0,
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
        .select("id, clinic_percentage")
        .eq("clinic_id", user.id);

      if (doctorsError) throw doctorsError;

      const doctorIds = clinicDoctors?.map(d => d.id) || [];
      const doctorPercentages: Record<string, number> = {};
      clinicDoctors?.forEach(d => {
        doctorPercentages[d.id] = d.clinic_percentage || 0;
      });

      if (doctorIds.length === 0) {
        setAppointments([]);
        setTotalRevenue(0);
        setClinicShare(0);
        setDoctorsShare(0);
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
          doctor_id,
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
        doctor_id: apt.doctor_id,
        clinic_percentage: doctorPercentages[apt.doctor_id] || 0,
      }));

      // Calculate totals
      const total = appointmentData.reduce((sum, apt) => sum + apt.total_fee, 0);
      const clinicTotal = appointmentData.reduce((sum, apt) => {
        return sum + (apt.total_fee * apt.clinic_percentage / 100);
      }, 0);
      const doctorsTotal = total - clinicTotal;

      setAppointments(appointmentData);
      setTotalRevenue(total);
      setClinicShare(clinicTotal);
      setDoctorsShare(doctorsTotal);
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

  // Calculate per-doctor revenue when a specific doctor is selected
  const getSelectedDoctorInfo = () => {
    if (selectedDoctor === "all") return null;
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return null;
    
    const doctorRevenue = appointments.reduce((sum, apt) => sum + apt.total_fee, 0);
    const doctorClinicShare = doctorRevenue * doctor.clinic_percentage / 100;
    const doctorDrShare = doctorRevenue - doctorClinicShare;
    
    return {
      name: doctor.name,
      percentage: doctor.clinic_percentage,
      totalRevenue: doctorRevenue,
      clinicShare: doctorClinicShare,
      drShare: doctorDrShare,
    };
  };

  const selectedDoctorInfo = getSelectedDoctorInfo();

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
          <p className="text-muted-foreground">Track your revenue and share breakdown by date</p>
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
                  {doctor.name} ({doctor.clinic_percentage}%)
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
                {selectedDate ? format(selectedDate, "PPP") : <span>All Time</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date > new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(undefined)}
              title="Clear date filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Banknote className="h-5 w-5" />
              Total Revenue
            </CardTitle>
            <CardDescription className="text-green-100 text-sm">
              {selectedDate ? format(selectedDate, "MMM d, yyyy") : "All time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Clinic Share Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Clinic Share
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm">
              {selectedDoctor !== "all" && selectedDoctorInfo 
                ? `${selectedDoctorInfo.percentage}% from ${selectedDoctorInfo.name}`
                : "Based on each doctor's %"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {clinicShare.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Doctors Share Card */}
        <Card className="bg-gradient-to-br from-info to-info/80 text-info-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              {selectedDoctor !== "all" ? "Doctor Share" : "All Doctors Share"}
            </CardTitle>
            <CardDescription className="text-info-foreground/80 text-sm">
              {selectedDoctor !== "all" && selectedDoctorInfo 
                ? `${100 - selectedDoctorInfo.percentage}% for ${selectedDoctorInfo.name}`
                : "Combined doctor earnings"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {doctorsShare.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Clinic Share</TableHead>
                    <TableHead className="text-right">Dr Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((apt) => {
                      const aptClinicShare = apt.total_fee * apt.clinic_percentage / 100;
                      const aptDrShare = apt.total_fee - aptClinicShare;
                      return (
                        <TableRow key={apt.id} className="hover:bg-accent/50">
                          <TableCell className="font-medium">{apt.patient_name}</TableCell>
                          <TableCell>{apt.patient_id}</TableCell>
                          <TableCell>{apt.appointment_time}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {apt.total_fee.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-primary font-medium">
                            {aptClinicShare.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-info font-medium">
                            {aptDrShare.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
