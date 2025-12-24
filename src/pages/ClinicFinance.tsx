import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar as CalendarIcon, Banknote, Building2, Stethoscope, X, Download, Receipt, TrendingUp, TrendingDown, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VisitRecordDialog } from "@/components/VisitRecordDialog";
import { TablePagination } from "@/components/TablePagination";

interface AppointmentRevenue {
  id: string;
  patient_name: string;
  patient_uuid: string;
  patient_id: string;
  patient_dob: string;
  patient_pregnancy_start_date: string | null;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  consultation_fee: number;
  other_fee: number;
  procedure_fee: number;
  sub_total: number;
  refund: number;
  total_fee: number;
  doctor_id: string;
  clinic_percentage: number;
}

interface Doctor {
  id: string;
  name: string;
  clinic_percentage: number;
}

interface ClinicDetails {
  clinic_name: string;
  phone_number: string;
  address: string;
  city: string;
  email: string;
}

interface VisitAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  patients: {
    full_name: string;
    patient_id: string;
    date_of_birth: string;
    pregnancy_start_date?: string | null;
  };
}

export default function ClinicFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinicDetails, setClinicDetails] = useState<ClinicDetails | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [clinicShare, setClinicShare] = useState(0);
  const [doctorsShare, setDoctorsShare] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchPatient, setSearchPatient] = useState("");
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [visitAppointment, setVisitAppointment] = useState<VisitAppointment | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchClinicDetails();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchRevenue();
  }, [startDate, endDate, selectedDoctor, doctors]);

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get clinic ID (for both clinic owner and receptionist)
      let clinicId = user.id;
      
      const { data: receptionistData } = await supabase
        .from("clinic_receptionists")
        .select("clinic_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (receptionistData) {
        clinicId = receptionistData.clinic_id;
      }

      let query = supabase
        .from("clinic_expenses")
        .select("amount")
        .eq("clinic_id", clinicId);

      if (startDate) {
        query = query.gte("expense_date", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        query = query.lte("expense_date", format(endDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = (data || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
      setTotalExpenses(total);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchClinicDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("clinic_name, phone_number, address, city")
        .eq("id", user.id)
        .maybeSingle();

      if (clinicError) throw clinicError;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (clinicData) {
        setClinicDetails({
          clinic_name: clinicData.clinic_name,
          phone_number: clinicData.phone_number,
          address: clinicData.address,
          city: clinicData.city,
          email: profileData?.email || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching clinic details:", error);
    }
  };

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
          procedure_fee,
          refund,
          total_fee,
          doctor_id,
          patients(id, full_name, patient_id, date_of_birth, pregnancy_start_date),
          doctors!appointments_doctor_id_fkey(profiles(full_name))
        `)
        .in("doctor_id", selectedDoctor !== "all" ? [selectedDoctor] : doctorIds)
        .eq("status", "completed")
        .order("appointment_date", { ascending: false });

      if (startDate) {
        query = query.gte("appointment_date", format(startDate, "yyyy-MM-dd"));
      }
      if (endDate) {
        query = query.lte("appointment_date", format(endDate, "yyyy-MM-dd"));
      }

      const { data, error } = await query;

      if (error) throw error;

      const appointmentData: AppointmentRevenue[] = (data || []).map((apt: any) => {
        const consultationFee = Number(apt.consultation_fee) || 0;
        const otherFee = Number(apt.other_fee) || 0;
        const procedureFee = Number(apt.procedure_fee) || 0;
        const refundAmount = Number(apt.refund) || 0;
        const subTotal = consultationFee + otherFee + procedureFee;
        const totalFee = subTotal - refundAmount; // Calculate total after discount
        return {
          id: apt.id,
          patient_name: apt.patients?.full_name || "Unknown",
          patient_uuid: apt.patients?.id || "",
          patient_id: apt.patients?.patient_id || "N/A",
          patient_dob: apt.patients?.date_of_birth || "",
          patient_pregnancy_start_date: apt.patients?.pregnancy_start_date || null,
          doctor_name: apt.doctors?.profiles?.full_name || "Unknown Doctor",
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time || "",
          consultation_fee: consultationFee,
          other_fee: otherFee,
          procedure_fee: procedureFee,
          sub_total: subTotal,
          refund: refundAmount,
          total_fee: totalFee,
          doctor_id: apt.doctor_id,
          clinic_percentage: doctorPercentages[apt.doctor_id] || 0,
        };
      });

      // Calculate totals
      const total = appointmentData.reduce((sum, apt) => sum + apt.total_fee, 0);
      const discount = appointmentData.reduce((sum, apt) => sum + apt.refund, 0);
      const clinicTotal = appointmentData.reduce((sum, apt) => {
        return sum + (apt.total_fee * apt.clinic_percentage / 100);
      }, 0);
      const doctorsTotal = total - clinicTotal;

      setAppointments(appointmentData);
      setTotalRevenue(total);
      setTotalDiscount(discount);
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

  const generatePDF = () => {
    if (!clinicDetails) {
      toast({
        title: "Error",
        description: "Clinic details not loaded",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header background
    doc.setFillColor(79, 70, 229); // Indigo color
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Clinic Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(clinicDetails.clinic_name, 14, 20);
    
    // Clinic Contact Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${clinicDetails.address}, ${clinicDetails.city}`, 14, 30);
    doc.text(`Phone: ${clinicDetails.phone_number} | Email: ${clinicDetails.email}`, 14, 37);
    
    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Finance Report", 14, 58);
    
    // Report subtitle with filters
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    
    const doctorName = selectedDoctor === "all" 
      ? "All Doctors" 
      : doctors.find(d => d.id === selectedDoctor)?.name || "Unknown";
    const dateRange = startDate && endDate 
      ? `${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}`
      : startDate 
        ? `From ${format(startDate, "MMM d, yyyy")}`
        : endDate 
          ? `Until ${format(endDate, "MMM d, yyyy")}`
          : "All Time";
    
    doc.text(`Doctor: ${doctorName} | Period: ${dateRange}`, 14, 66);
    doc.text(`Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 14, 73);
    
    // Summary Box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(14, 80, pageWidth - 28, 35, 3, 3, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    const boxY = 90;
    const col1 = 25;
    const col2 = pageWidth / 3 + 10;
    const col3 = (pageWidth / 3) * 2 + 5;
    
    doc.text("Total Revenue", col1, boxY);
    doc.text("Clinic Share", col2, boxY);
    doc.text("Doctors Share", col3, boxY);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`PKR ${totalRevenue.toLocaleString()}`, col1, boxY + 10);
    
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text(`PKR ${clinicShare.toLocaleString()}`, col2, boxY + 10);
    
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`PKR ${doctorsShare.toLocaleString()}`, col3, boxY + 10);
    
    // Table
    const tableData = appointments.map((apt) => {
      const aptClinicShare = apt.total_fee * apt.clinic_percentage / 100;
      const aptDrShare = apt.total_fee - aptClinicShare;
      return [
        apt.patient_name,
        apt.doctor_name,
        format(new Date(apt.appointment_date), "MMM d, yyyy"),
        `PKR ${apt.total_fee.toLocaleString()}`,
        `PKR ${aptClinicShare.toLocaleString()}`,
        `PKR ${aptDrShare.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: 125,
      head: [['Patient Name', 'Doctor', 'Date', 'Total Fee', 'Clinic Share', 'Dr Share']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | ${clinicDetails.clinic_name} - Finance Report`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `Finance_Report_${doctorName.replace(/\s+/g, '_')}_${dateRange.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    toast({
      title: "Success",
      description: "PDF report downloaded successfully",
    });
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
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="end">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => { setStartDate(date); setStartDateOpen(false); }}
                disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => { setEndDate(date); setEndDateOpen(false); }}
                disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
              title="Clear date filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={generatePDF}
            disabled={appointments.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Revenue Card */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Banknote className="h-5 w-5" />
              Total Revenue
            </CardTitle>
            <CardDescription className="text-green-100 text-sm">
              {startDate && endDate 
                ? `${format(startDate, "PP")} - ${format(endDate, "PP")}` 
                : startDate 
                  ? `From ${format(startDate, "PP")}` 
                  : endDate 
                    ? `Until ${format(endDate, "PP")}` 
                    : "All time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Total Discount Card */}
        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Banknote className="h-5 w-5" />
              Total Discount
            </CardTitle>
            <CardDescription className="text-red-100 text-sm">
              Refunds given
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              -{totalDiscount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
            <div className="text-2xl font-bold">
              {clinicShare.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Doctors Share Card */}
        <Card className="bg-gradient-to-br from-info to-info/80 text-info-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5" />
              {selectedDoctor !== "all" ? "Doctor Share" : "Doctors Share"}
            </CardTitle>
            <CardDescription className="text-info-foreground/80 text-sm">
              {selectedDoctor !== "all" && selectedDoctorInfo 
                ? `${100 - selectedDoctorInfo.percentage}% for ${selectedDoctorInfo.name}`
                : "Combined doctor earnings"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctorsShare.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Receipt className="h-5 w-5" />
              Expenses
            </CardTitle>
            <CardDescription className="text-orange-100 text-sm">
              Clinic operating costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              -{totalExpenses.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Net Profit/Loss Card */}
        <Card className={cn(
          "text-white",
          (clinicShare - totalExpenses) >= 0 
            ? "bg-gradient-to-br from-emerald-600 to-teal-700" 
            : "bg-gradient-to-br from-rose-600 to-red-700"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              {(clinicShare - totalExpenses) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              Net {(clinicShare - totalExpenses) >= 0 ? "Profit" : "Loss"}
            </CardTitle>
            <CardDescription className="text-white/80 text-sm">
              Clinic Share - Expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(clinicShare - totalExpenses).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Appointments Revenue</CardTitle>
              <CardDescription>
                Revenue breakdown for each appointment {(startDate || endDate) ? "in selected date range" : ""}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient or doctor..."
                value={searchPatient}
                onChange={(e) => { setSearchPatient(e.target.value); setCurrentPage(1); }}
                className="pl-9 w-[220px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const filteredAppointments = appointments.filter(apt =>
              apt.patient_name.toLowerCase().includes(searchPatient.toLowerCase()) ||
              apt.doctor_name.toLowerCase().includes(searchPatient.toLowerCase())
            );
            return filteredAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No completed appointments found{(startDate || endDate) ? " for selected date range" : ""}{searchPatient ? " matching your search" : ""}.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sub Total</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Clinic Share</TableHead>
                    <TableHead className="text-right">Dr Share</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((apt) => {
                      const aptClinicShare = apt.total_fee * apt.clinic_percentage / 100;
                      const aptDrShare = apt.total_fee - aptClinicShare;
                      return (
                        <TableRow key={apt.id} className="hover:bg-accent/50">
                          <TableCell className="font-medium">{apt.patient_name}</TableCell>
                          <TableCell>{apt.doctor_name}</TableCell>
                          <TableCell>{format(new Date(apt.appointment_date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {apt.sub_total.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-red-600 dark:text-red-400">
                            {apt.refund > 0 ? `-${apt.refund.toLocaleString('en-PK', { minimumFractionDigits: 0 })}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {apt.total_fee.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-primary font-medium">
                            {aptClinicShare.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-right text-info font-medium">
                            {aptDrShare.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVisitAppointment({
                                  id: apt.id,
                                  patient_id: apt.patient_uuid,
                                  doctor_id: apt.doctor_id,
                                  appointment_date: apt.appointment_date,
                                  appointment_time: apt.appointment_time,
                                  patients: {
                                    full_name: apt.patient_name,
                                    patient_id: apt.patient_id,
                                    date_of_birth: apt.patient_dob,
                                    pregnancy_start_date: apt.patient_pregnancy_start_date,
                                  },
                                });
                                setShowVisitDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              
              <TablePagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredAppointments.length / itemsPerPage)}
                pageSize={itemsPerPage}
                totalItems={filteredAppointments.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setItemsPerPage(size); setCurrentPage(1); }}
              />
            </>
          );
          })()}
        </CardContent>
      </Card>

      <VisitRecordDialog
        open={showVisitDialog}
        onOpenChange={setShowVisitDialog}
        appointment={visitAppointment}
      />
    </div>
  );
}
