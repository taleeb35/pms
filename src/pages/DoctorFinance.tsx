import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Banknote, Calendar as CalendarIcon, Download } from "lucide-react";
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

interface DoctorDetails {
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
}

export default function DoctorFinance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentRevenue[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);

  useEffect(() => {
    fetchDoctorDetails();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [selectedDate]);

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
        .select("specialization, clinic_id")
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
          appointment_date,
          appointment_time,
          consultation_fee,
          other_fee,
          total_fee,
          patients(full_name, patient_id)
        `)
        .eq("doctor_id", user.id)
        .eq("status", "completed")
        .order("appointment_date", { ascending: false });

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
    const reportTitle = selectedDate 
      ? `Revenue Report - ${format(selectedDate, "MMMM d, yyyy")}`
      : "Revenue Report - All Time";
    doc.text(reportTitle, 14, 58);
    
    // Generated date
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${format(new Date(), "PPP 'at' p")}`, 14, 65);
    
    // Summary Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, 72, pageWidth - 28, 25, 3, 3, "F");
    doc.setDrawColor(34, 197, 94);
    doc.roundedRect(14, 72, pageWidth - 28, 25, 3, 3, "S");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Revenue", 24, 83);
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text(totalRevenue.toLocaleString("en-PK", { minimumFractionDigits: 2 }), 24, 92);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Appointments: ${appointments.length}`, pageWidth - 24, 87, { align: "right" });
    
    // Appointments Table
    const tableData = appointments.map((apt) => [
      apt.patient_name,
      apt.patient_id,
      format(new Date(apt.appointment_date), "MMM d, yyyy"),
      apt.consultation_fee.toLocaleString("en-PK", { minimumFractionDigits: 2 }),
      apt.other_fee.toLocaleString("en-PK", { minimumFractionDigits: 2 }),
      apt.total_fee.toLocaleString("en-PK", { minimumFractionDigits: 2 }),
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [["Patient Name", "Patient ID", "Date", "Consultation Fee", "Other Fee", "Total"]],
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
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right", fontStyle: "bold" },
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
    const fileName = selectedDate 
      ? `Revenue_Report_${format(selectedDate, "yyyy-MM-dd")}.pdf`
      : `Revenue_Report_All_Time.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF Downloaded",
      description: "Your revenue report has been downloaded successfully.",
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track your revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>All dates</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
              Clear Date
            </Button>
          )}
          <Button onClick={generatePDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
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
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "All Time"}
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
                Revenue breakdown for {selectedDate ? format(selectedDate, "PPP") : "all completed appointments"}
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
              No completed appointments found{selectedDate ? " for this date" : ""}.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Date</TableHead>
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
                      <TableCell>{format(new Date(apt.appointment_date), "MMM d, yyyy")}</TableCell>
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
