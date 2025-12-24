import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Banknote, Calendar as CalendarIcon, Download, Building2, Stethoscope, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VisitRecordDialog } from "@/components/VisitRecordDialog";

interface AppointmentRevenue {
  id: string;
  patient_name: string;
  patient_id: string;
  patient_uuid: string;
  patient_dob: string;
  patient_pregnancy_start_date: string | null;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_fee: number;
  other_fee: number;
  procedure_fee: number;
  sub_total: number;
  refund: number;
  total_fee: number;
  clinic_share: number;
  doctor_share: number;
}

interface DoctorDetails {
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_percentage: number;
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

export default function DoctorFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [clinicShare, setClinicShare] = useState(0);
  const [doctorShare, setDoctorShare] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
  const [searchPatient, setSearchPatient] = useState("");
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [visitAppointment, setVisitAppointment] = useState<VisitAppointment | null>(null);

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    if (doctorDetails) {
      fetchRevenue();
    }
  }, [startDate, endDate, doctorDetails]);

  const fetchDoctorDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      const { data: doctorData } = await supabase
        .from("doctors")
        .select("specialization, clinic_id, clinic_percentage")
        .eq("id", user.id)
        .maybeSingle();

      let clinicInfo = { clinic_name: "", clinic_address: "", clinic_phone: "" };
      if (doctorData?.clinic_id) {
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("clinic_name, address, phone_number")
          .eq("id", doctorData.clinic_id)
          .maybeSingle();
        
        if (clinicData) {
          clinicInfo = {
            clinic_name: clinicData.clinic_name,
            clinic_address: clinicData.address,
            clinic_phone: clinicData.phone_number,
          };
        }
      }

      setDoctorDetails({
        full_name: profileData?.full_name || "Doctor",
        email: profileData?.email || "",
        phone: profileData?.phone || "",
        specialization: doctorData?.specialization || "",
        clinic_percentage: Number(doctorData?.clinic_percentage) || 0,
        ...clinicInfo,
      });
    } catch (error) {
      console.error("Error fetching doctor details:", error);
    }
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("appointments")
        .select(`
          id,
          doctor_id,
          appointment_date,
          appointment_time,
          consultation_fee,
          other_fee,
          procedure_fee,
          refund,
          total_fee,
          patients(id, full_name, patient_id, date_of_birth, pregnancy_start_date)
        `)
        .eq("doctor_id", user.id)
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

      const clinicPct = doctorDetails?.clinic_percentage || 0;
      const doctorPct = 100 - clinicPct;

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
          patient_id: apt.patients?.patient_id || "N/A",
          patient_uuid: apt.patients?.id || "",
          patient_dob: apt.patients?.date_of_birth || "",
          patient_pregnancy_start_date: apt.patients?.pregnancy_start_date || null,
          doctor_id: apt.doctor_id,
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          consultation_fee: consultationFee,
          other_fee: otherFee,
          procedure_fee: procedureFee,
          sub_total: subTotal,
          refund: refundAmount,
          total_fee: totalFee,
          clinic_share: (totalFee * clinicPct) / 100,
          doctor_share: (totalFee * doctorPct) / 100,
        };
      });

      setAppointments(appointmentData);
      const total = appointmentData.reduce((sum, apt) => sum + apt.total_fee, 0);
      const discount = appointmentData.reduce((sum, apt) => sum + apt.refund, 0);
      const subTotalSum = appointmentData.reduce((sum, apt) => sum + apt.sub_total, 0);
      setTotalRevenue(total);
      setTotalDiscount(discount);
      setClinicShare((total * clinicPct) / 100);
      setDoctorShare((total * doctorPct) / 100);
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const clinicPct = doctorDetails?.clinic_percentage || 0;
    const doctorPct = 100 - clinicPct;
    
    // Header with clinic/doctor details
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(doctorDetails?.clinic_name || "Medical Practice", 14, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Dr. ${doctorDetails?.full_name || ""}`, 14, 26);
    doc.text(doctorDetails?.specialization || "", 14, 32);
    doc.text(doctorDetails?.clinic_address || "", 14, 38);
    
    // Contact info on right
    doc.text(doctorDetails?.email || "", pageWidth - 14, 26, { align: "right" });
    doc.text(doctorDetails?.phone || "", pageWidth - 14, 32, { align: "right" });
    doc.text(doctorDetails?.clinic_phone || "", pageWidth - 14, 38, { align: "right" });
    
    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const reportTitle = startDate && endDate 
      ? `Revenue Report - ${format(startDate, "MMM d, yyyy")} to ${format(endDate, "MMM d, yyyy")}`
      : startDate 
        ? `Revenue Report - From ${format(startDate, "MMM d, yyyy")}`
        : endDate 
          ? `Revenue Report - Until ${format(endDate, "MMM d, yyyy")}`
          : "Revenue Report - All Time";
    doc.text(reportTitle, 14, 58);
    
    // Generated date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), "PPP 'at' p")}`, 14, 65);
    
    // Summary Boxes
    const boxWidth = (pageWidth - 42) / 3;
    
    // Total Revenue Box
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(14, 72, boxWidth, 28, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total Revenue", 20, 82);
    doc.setFontSize(16);
    doc.text(totalRevenue.toLocaleString("en-PK"), 20, 94);
    
    // Clinic Share Box
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(14 + boxWidth + 7, 72, boxWidth, 28, 3, 3, "F");
    doc.setFontSize(10);
    doc.text("Clinic Share", 20 + boxWidth + 7, 82);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${clinicPct}% of revenue`, 20 + boxWidth + 7, 88);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(clinicShare.toLocaleString("en-PK"), 20 + boxWidth + 7, 96);
    
    // Doctor Share Box
    doc.setFillColor(6, 182, 212);
    doc.roundedRect(14 + (boxWidth + 7) * 2, 72, boxWidth, 28, 3, 3, "F");
    doc.setFontSize(10);
    doc.text("Doctor Share", 20 + (boxWidth + 7) * 2, 82);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${doctorPct}% of revenue`, 20 + (boxWidth + 7) * 2, 88);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(doctorShare.toLocaleString("en-PK"), 20 + (boxWidth + 7) * 2, 96);
    
    // Appointments Table
    const tableData = appointments.map((apt) => [
      apt.patient_name,
      format(new Date(apt.appointment_date), "MMM d, yyyy"),
      apt.total_fee.toLocaleString("en-PK"),
      apt.clinic_share.toLocaleString("en-PK"),
      apt.doctor_share.toLocaleString("en-PK"),
    ]);
    
    autoTable(doc, {
      startY: 108,
      head: [["Patient Name", "Date", "Total Fee", "Clinic Share", "Dr Share"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right", textColor: [99, 102, 241] },
        4: { halign: "right", textColor: [6, 182, 212], fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });
    
    // Save
    const fileName = startDate && endDate 
      ? `Revenue_Report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}.pdf`
      : `Revenue_Report_All_Time.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF Downloaded",
      description: "Your revenue report has been downloaded successfully.",
    });
  };

  const clinicPct = doctorDetails?.clinic_percentage || 0;
  const doctorPct = 100 - clinicPct;

  if (loading && !doctorDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track your revenue and share breakdown by date</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>
              Clear
            </Button>
          )}
          <Button onClick={generatePDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
              <Banknote className="h-4 w-4" />
              Total Revenue
            </CardTitle>
            <CardDescription className="text-green-100">
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
            <div className="text-3xl font-bold">
              {totalRevenue.toLocaleString('en-PK')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
              <Banknote className="h-4 w-4" />
              Total Discount
            </CardTitle>
            <CardDescription className="text-red-100">
              Refunds given
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              -{totalDiscount.toLocaleString('en-PK')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Clinic Share
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {clinicPct}% of revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {clinicShare.toLocaleString('en-PK')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-sm font-medium">
              <Stethoscope className="h-4 w-4" />
              Doctor Share
            </CardTitle>
            <CardDescription className="text-cyan-100">
              {doctorPct}% for Dr. {doctorDetails?.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {doctorShare.toLocaleString('en-PK')}
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
                Revenue breakdown for each appointment on selected date
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient..."
                  value={searchPatient}
                  onChange={(e) => { setSearchPatient(e.target.value); setCurrentPage(1); }}
                  className="pl-9 w-[200px]"
                />
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (() => {
            const filteredAppointments = appointments.filter(apt =>
              apt.patient_name.toLowerCase().includes(searchPatient.toLowerCase())
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
                    .map((apt) => (
                    <TableRow key={apt.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium">{apt.patient_name}</TableCell>
                      <TableCell>{format(new Date(apt.appointment_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {apt.sub_total.toLocaleString('en-PK')}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {apt.refund > 0 ? `-${apt.refund.toLocaleString('en-PK')}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {apt.total_fee.toLocaleString('en-PK')}
                      </TableCell>
                      <TableCell className="text-right text-indigo-600 dark:text-indigo-400">
                        {apt.clinic_share.toLocaleString('en-PK')}
                      </TableCell>
                      <TableCell className="text-right font-bold text-cyan-600 dark:text-cyan-400">
                        {apt.doctor_share.toLocaleString('en-PK')}
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
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {filteredAppointments.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} entries
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filteredAppointments.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAppointments.length / itemsPerPage), p + 1))}
                          className={currentPage === Math.ceil(filteredAppointments.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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