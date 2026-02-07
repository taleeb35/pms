import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, Printer, ChevronUp, ChevronDown, MoreHorizontal, Phone, Mail, MapPin, User, FileText, Clock, CheckCircle, XCircle, Play, Pencil } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { VisitHistory } from "@/components/VisitHistory";
import { PatientMedicalDocsView } from "@/components/PatientMedicalDocsView";
import { AppointmentTimeline } from "@/components/AppointmentTimeline";
import { calculatePregnancyDuration, calculateExpectedDueDate } from "@/lib/pregnancyUtils";
import { isTimeSlotAvailable } from "@/lib/appointmentUtils";
import { DoctorTimeSelect } from "@/components/DoctorTimeSelect";
import { logActivity } from "@/lib/activityLogger";

interface Procedure {
  id: string;
  name: string;
  price: number;
}

interface ICDCode {
  id: string;
  code: string;
  description: string;
}

interface DiseaseTemplate {
  id: string;
  disease_name: string;
  prescription_template: string;
}

interface TestTemplate {
  id: string;
  title: string;
  description: string;
}

interface AppointmentData {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  notes: string | null;
  consultation_fee: number | null;
  other_fee: number | null;
  procedure_fee: number | null;
  procedure_id: string | null;
  icd_code_id: string | null;
  refund: number | null;
  confidential_notes: string | null;
  created_at: string;
  patients: {
    id: string;
    full_name: string;
    patient_id: string;
    date_of_birth: string;
    phone: string;
    email: string | null;
    gender: string;
    address: string | null;
    city: string | null;
    blood_group: string | null;
    pregnancy_start_date: string | null;
    allergies: string | null;
    major_diseases: string | null;
  };
}

const DoctorAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState<any>(null);
  
  // Doctor specialization
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [isOphthalmologist, setIsOphthalmologist] = useState(false);
  
  // Pregnancy
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date>();
  const [pregnancyDatePopoverOpen, setPregnancyDatePopoverOpen] = useState(false);
  
  // Procedures & Templates
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [procedureFee, setProcedureFee] = useState<string>("");
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [selectedICDCode, setSelectedICDCode] = useState<string>("");
  const [diseaseTemplates, setDiseaseTemplates] = useState<DiseaseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [selectedTestTemplate, setSelectedTestTemplate] = useState<string>("");
  
  // Next Visit
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [nextVisitTime, setNextVisitTime] = useState<string>("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    blood_pressure: "",
    temperature: "",
    pulse: "",
    weight: "",
    height: "",
    pain_scale: null as number | null,
    right_eye_vision: "",
    left_eye_vision: "",
    chief_complaint: "",
    patient_history: "",
    current_prescription: "",
    test_reports: "",
    next_visit_notes: "",
    consultation_fee: "",
    other_fee: "",
    refund: "",
    confidential_notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients(
            id, full_name, patient_id, date_of_birth, phone, email, gender, 
            address, city, blood_group, pregnancy_start_date, allergies, major_diseases
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAppointment(data);
      
      // First check for existing record to know if we should set default consultation fee
      const existingRecordResult = await fetchExistingRecord(data.id);
      
      // Fetch related data
      await Promise.all([
        checkDoctorSpecialization(data.doctor_id, !!existingRecordResult),
        fetchPatientPregnancyDate(data.patient_id),
        fetchDiseaseTemplates(data.doctor_id),
        fetchTestTemplates(data.doctor_id),
      ]);
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      toast({ title: "Error", description: "Failed to load appointment details", variant: "destructive" });
      navigate("/doctor/appointments");
    } finally {
      setLoading(false);
    }
  };

  const checkDoctorSpecialization = async (doctorId: string, hasExistingRecord: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("specialization, consultation_fee, clinic_id")
        .eq("id", doctorId)
        .maybeSingle();

      if (error) throw error;

      const spec = data?.specialization?.toLowerCase() || "";
      setIsGynecologist(spec.includes("gynecologist"));
      setIsOphthalmologist(spec.includes("ophthalmologist"));

      // Set default consultation fee from doctor's profile if no existing record
      if (!hasExistingRecord && data?.consultation_fee) {
        setFormData(prev => ({ ...prev, consultation_fee: data.consultation_fee.toString() }));
      }

      // Fetch procedures
      fetchProcedures(doctorId);

      // Fetch ICD codes
      if (data?.clinic_id) {
        fetchICDCodes(data.clinic_id);
      }
    } catch (error) {
      console.error("Error checking doctor specialization:", error);
    }
  };

  const fetchProcedures = async (doctorId: string) => {
    const { data } = await supabase
      .from("procedures")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("name");
    setProcedures(data || []);
  };

  const fetchICDCodes = async (clinicId: string) => {
    const { data } = await supabase
      .from("clinic_icd_codes")
      .select("*")
      .eq("clinic_id", clinicId)
      .order("code");
    setIcdCodes(data || []);
  };

  const fetchDiseaseTemplates = async (doctorId: string) => {
    try {
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("clinic_id")
        .eq("id", doctorId)
        .maybeSingle();

      const { data: doctorTemplates } = await supabase
        .from("doctor_disease_templates")
        .select("id, disease_name, prescription_template")
        .eq("doctor_id", doctorId)
        .order("disease_name");

      let clinicTemplates: DiseaseTemplate[] = [];
      if (doctorData?.clinic_id) {
        const { data: cTemplates } = await supabase
          .from("doctor_disease_templates")
          .select("id, disease_name, prescription_template")
          .eq("clinic_id", doctorData.clinic_id)
          .is("doctor_id", null)
          .order("disease_name");
        clinicTemplates = cTemplates || [];
      }

      const allTemplates = [...(doctorTemplates || []), ...clinicTemplates];
      const uniqueTemplates = allTemplates.filter((template, index, self) =>
        index === self.findIndex(t => t.disease_name === template.disease_name)
      );
      setDiseaseTemplates(uniqueTemplates);
    } catch (error) {
      console.error("Error fetching disease templates:", error);
    }
  };

  const fetchTestTemplates = async (doctorId: string) => {
    try {
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("clinic_id")
        .eq("id", doctorId)
        .maybeSingle();

      const { data: doctorTemplates } = await supabase
        .from("doctor_test_templates")
        .select("id, title, description")
        .eq("doctor_id", doctorId)
        .order("title");

      let clinicTemplates: TestTemplate[] = [];
      if (doctorData?.clinic_id) {
        const { data: cTemplates } = await supabase
          .from("doctor_test_templates")
          .select("id, title, description")
          .eq("clinic_id", doctorData.clinic_id)
          .is("doctor_id", null)
          .order("title");
        clinicTemplates = cTemplates || [];
      }

      const allTemplates = [...(doctorTemplates || []), ...clinicTemplates];
      const uniqueTemplates = allTemplates.filter((template, index, self) =>
        index === self.findIndex(t => t.title === template.title)
      );
      setTestTemplates(uniqueTemplates);
    } catch (error) {
      console.error("Error fetching test templates:", error);
    }
  };

  const fetchPatientPregnancyDate = async (patientId: string) => {
    try {
      const { data } = await supabase
        .from("patients")
        .select("pregnancy_start_date")
        .eq("id", patientId)
        .single();

      if (data?.pregnancy_start_date) {
        setPregnancyStartDate(new Date(data.pregnancy_start_date));
      }
    } catch (error) {
      console.error("Error fetching pregnancy date:", error);
    }
  };

  const fetchExistingRecord = async (appointmentId: string) => {
    const { data, error } = await supabase
      .from("visit_records")
      .select("*")
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching visit record:", error);
      return;
    }

    if (data) {
      setExistingRecord(data);

      // Also fetch appointment fees
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("consultation_fee, other_fee, procedure_id, procedure_fee, confidential_notes, icd_code_id, refund")
        .eq("id", appointmentId)
        .single();

      setFormData({
        blood_pressure: data.blood_pressure || "",
        temperature: data.temperature || "",
        pulse: data.pulse || "",
        weight: data.weight || "",
        height: data.height || "",
        pain_scale: data.pain_scale || null,
        right_eye_vision: data.right_eye_vision || "",
        left_eye_vision: data.left_eye_vision || "",
        chief_complaint: data.chief_complaint || "",
        patient_history: data.patient_history || "",
        current_prescription: data.current_prescription || "",
        test_reports: data.test_reports || "",
        next_visit_notes: data.next_visit_notes || "",
        consultation_fee: appointmentData?.consultation_fee?.toString() || "",
        other_fee: appointmentData?.other_fee?.toString() || "",
        refund: appointmentData?.refund?.toString() || "",
        confidential_notes: appointmentData?.confidential_notes || "",
      });

      if (appointmentData?.procedure_id) {
        setSelectedProcedure(appointmentData.procedure_id);
        setProcedureFee(appointmentData.procedure_fee?.toString() || "");
      }

      if (appointmentData?.icd_code_id) {
        setSelectedICDCode(appointmentData.icd_code_id);
      }

      if (data.next_visit_date) {
        setNextVisitDate(new Date(data.next_visit_date));
      }
    }
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "no_show": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId && templateId !== "none") {
      const template = diseaseTemplates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({ ...prev, current_prescription: template.prescription_template }));
      }
    }
  };

  const handleProcedureChange = (procedureId: string) => {
    setSelectedProcedure(procedureId);
    const procedure = procedures.find(p => p.id === procedureId);
    setProcedureFee(procedure ? procedure.price.toString() : "");
  };

  const handleTestTemplateChange = (templateId: string) => {
    setSelectedTestTemplate(templateId);
    if (templateId && templateId !== "none") {
      const template = testTemplates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({ ...prev, test_reports: template.description }));
      }
    }
  };

  const handleStatusChange = async (newStatus: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show") => {
    if (!appointment) return;
    
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointment.id);

      if (error) throw error;

      await logActivity({
        action: newStatus === "cancelled" ? "appointment_cancelled" : 
               newStatus === "completed" ? "appointment_completed" : "appointment_status_changed",
        entityType: "appointment",
        entityId: appointment.id,
        details: {
          patient_name: appointment.patients.full_name,
          new_status: newStatus,
        },
      });

      toast({ title: "Success", description: "Status updated successfully" });
      fetchAppointmentDetails();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !appointment) return;

    const patientName = appointment.patients.full_name;
    const patientId = appointment.patients.patient_id;
    const patientAge = calculateAge(appointment.patients.date_of_birth);
    const visitDate = format(new Date(appointment.appointment_date), "dd MMMM yyyy");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Visit Record</title>
        <style>
          @page { margin: 3.5cm 1.5cm 2.5cm 1.5cm; size: A4; }
          body { font-family: 'Segoe UI', sans-serif; font-size: 10pt; line-height: 1.4; color: #222; }
          .header { text-align: right; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
          .patient-info { display: flex; gap: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px; margin-bottom: 15px; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 9pt; color: #555; }
          .content-box { padding: 10px; background: #fafafa; border-left: 3px solid #333; white-space: pre-wrap; }
          .prescription-box { padding: 10px; background: #fffbeb; border-left: 3px solid #f59e0b; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header">Date: ${visitDate}</div>
        <div class="patient-info">
          <div><strong>Name:</strong> ${patientName}</div>
          <div><strong>ID:</strong> ${patientId}</div>
          <div><strong>Age:</strong> ${patientAge} years</div>
        </div>
        ${formData.chief_complaint ? `<div class="section"><div class="section-title">Chief Complaint</div><div class="content-box">${formData.chief_complaint}</div></div>` : ''}
        ${formData.current_prescription ? `<div class="section"><div class="section-title">℞ Prescription</div><div class="prescription-box">${formData.current_prescription}</div></div>` : ''}
        ${formData.test_reports ? `<div class="section"><div class="section-title">Tests</div><div class="content-box">${formData.test_reports}</div></div>` : ''}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setSaving(true);
    try {
      const visitData = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        blood_pressure: formData.blood_pressure,
        temperature: formData.temperature,
        pulse: formData.pulse,
        weight: formData.weight,
        height: formData.height,
        pain_scale: formData.pain_scale,
        right_eye_vision: formData.right_eye_vision || null,
        left_eye_vision: formData.left_eye_vision || null,
        chief_complaint: formData.chief_complaint,
        patient_history: formData.patient_history,
        current_prescription: formData.current_prescription,
        test_reports: formData.test_reports,
        next_visit_notes: formData.next_visit_notes,
        next_visit_date: nextVisitDate ? format(nextVisitDate, "yyyy-MM-dd") : null,
      };

      let error;
      if (existingRecord) {
        ({ error } = await supabase.from("visit_records").update(visitData).eq("id", existingRecord.id));
      } else {
        ({ error } = await supabase.from("visit_records").insert([visitData]));
      }

      if (error) throw error;

      // Update appointment fees
      const consultationFee = formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0;
      const otherFee = formData.other_fee ? parseFloat(formData.other_fee) : 0;
      const procFee = procedureFee ? parseFloat(procedureFee) : 0;
      const refundAmount = formData.refund ? parseFloat(formData.refund) : 0;

      const appointmentUpdate: any = {
        consultation_fee: consultationFee,
        other_fee: otherFee,
        refund: refundAmount,
        status: 'completed',
        confidential_notes: formData.confidential_notes || null,
        icd_code_id: selectedICDCode || null,
      };

      if (selectedProcedure) {
        appointmentUpdate.procedure_id = selectedProcedure;
        appointmentUpdate.procedure_fee = procFee;
      }

      const { error: feeError } = await supabase
        .from("appointments")
        .update(appointmentUpdate)
        .eq("id", appointment.id);

      if (feeError) throw feeError;

      // Update pregnancy date if gynecologist
      if (isGynecologist && pregnancyStartDate) {
        await supabase
          .from("patients")
          .update({ pregnancy_start_date: format(pregnancyStartDate, "yyyy-MM-dd") })
          .eq("id", appointment.patient_id);
      }

      // Create follow-up appointment if next visit date is set
      if (nextVisitDate) {
        const followUpDate = format(nextVisitDate, "yyyy-MM-dd");
        const followUpTime = nextVisitTime || appointment.appointment_time;

        const { available } = await isTimeSlotAvailable(appointment.doctor_id, followUpDate, followUpTime);

        if (available) {
          await supabase.from("appointments").insert({
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            appointment_date: followUpDate,
            appointment_time: followUpTime,
            duration_minutes: 30,
            status: "scheduled",
            reason: "Follow-up visit",
            notes: formData.next_visit_notes || null,
          });
        }
      }

      toast({
        title: "Success",
        description: `Visit record ${existingRecord ? 'updated' : 'saved'} successfully`,
      });

      fetchAppointmentDetails();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return <div className="text-center py-8 text-muted-foreground">Appointment not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header - Shopify Style */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/doctor/appointments">Appointments</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>#{appointment.patients.patient_id}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">#{appointment.patients.patient_id}</h1>
            <Badge variant="outline" className={cn("capitalize", getStatusColor(appointment.status))}>
              {appointment.status.replace("_", " ")}
            </Badge>
            <span className="text-muted-foreground">
              {format(new Date(appointment.appointment_date), "MMMM d, yyyy")} at {appointment.appointment_time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                <Play className="h-4 w-4 mr-2" /> Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} className="text-destructive">
                <XCircle className="h-4 w-4 mr-2" /> Cancel Appointment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex">
            <Button variant="outline" size="icon" className="rounded-r-none border-r-0">
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-l-none">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <FileText className="h-3 w-3 mr-1" />
                      {existingRecord ? "Update Visit" : "Record Visit"}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vitals Section */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Blood Pressure</Label>
                      <Input
                        placeholder="120/80"
                        value={formData.blood_pressure}
                        onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Temperature</Label>
                      <Input
                        placeholder="98.6°F"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pulse</Label>
                      <Input
                        placeholder="72 bpm"
                        value={formData.pulse}
                        onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Weight (kg)</Label>
                      <Input
                        placeholder="70"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height (cm)</Label>
                      <Input
                        placeholder="170"
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">BMI</Label>
                      <div className="h-9 px-3 py-2 rounded-md border border-input bg-muted flex items-center text-sm">
                        {(() => {
                          const weight = parseFloat(formData.weight);
                          const heightCm = parseFloat(formData.height);
                          if (weight > 0 && heightCm > 0) {
                            const heightM = heightCm / 100;
                            const bmi = weight / (heightM * heightM);
                            return <span className="font-medium">{bmi.toFixed(1)}</span>;
                          }
                          return <span className="text-muted-foreground">—</span>;
                        })()}
                      </div>
                    </div>
                    {isOphthalmologist ? (
                      <>
                        <div>
                          <Label className="text-xs">Right Eye Vision</Label>
                          <Input
                            placeholder="6/6"
                            value={formData.right_eye_vision}
                            onChange={(e) => setFormData({...formData, right_eye_vision: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left Eye Vision</Label>
                          <Input
                            placeholder="6/6"
                            value={formData.left_eye_vision}
                            onChange={(e) => setFormData({...formData, left_eye_vision: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-full">
                        <Label className="text-xs">Pain Scale (0-10)</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={formData.pain_scale ? [formData.pain_scale] : [0]}
                            onValueChange={(value) => setFormData({...formData, pain_scale: value[0] === 0 ? null : value[0]})}
                            max={10}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <div className={cn(
                            "w-12 h-9 rounded-md border flex items-center justify-center font-bold",
                            !formData.pain_scale && "bg-muted text-muted-foreground",
                            formData.pain_scale && formData.pain_scale <= 3 && "bg-green-100 text-green-700",
                            formData.pain_scale && formData.pain_scale > 3 && formData.pain_scale <= 6 && "bg-amber-100 text-amber-700",
                            formData.pain_scale && formData.pain_scale > 6 && "bg-red-100 text-red-700"
                          )}>
                            {formData.pain_scale || "—"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chief Complaint */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Chief Complaint</Label>
                  <Textarea
                    placeholder="Patient's main complaint or reason for visit..."
                    value={formData.chief_complaint}
                    onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                {/* ICD Code */}
                {icdCodes.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Diagnosis (ICD Code)</Label>
                    <Select value={selectedICDCode || "none"} onValueChange={(val) => setSelectedICDCode(val === "none" ? "" : val)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select ICD code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">No ICD Code</SelectItem>
                        {icdCodes.map((icd) => (
                          <SelectItem key={icd.id} value={icd.id}>
                            <span className="font-mono">{icd.code}</span> - {icd.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Prescription */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Current Prescription</Label>
                  {diseaseTemplates.length > 0 && (
                    <Select value={selectedTemplate || "none"} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="mt-2 mb-2">
                        <SelectValue placeholder="Load from template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Template --</SelectItem>
                        {diseaseTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.disease_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Textarea
                    placeholder="Medications, dosage, and instructions..."
                    value={formData.current_prescription}
                    onChange={(e) => setFormData({...formData, current_prescription: e.target.value})}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Card */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Payment
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {procedures.length > 0 && (
                    <div className="col-span-2">
                      <Label className="text-xs">Procedure</Label>
                      <Select value={selectedProcedure || "none"} onValueChange={(val) => handleProcedureChange(val === "none" ? "" : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select procedure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Procedure</SelectItem>
                          {procedures.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} - {p.price}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedProcedure && (
                    <div>
                      <Label className="text-xs">Procedure Fee</Label>
                      <Input type="number" value={procedureFee} onChange={(e) => setProcedureFee(e.target.value)} />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs">Consultation Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Other Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.other_fee}
                      onChange={(e) => setFormData({...formData, other_fee: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Discount/Refund</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.refund}
                      onChange={(e) => setFormData({...formData, refund: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-green-200">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-green-700">
                    Rs. {((parseFloat(formData.consultation_fee) || 0) + (parseFloat(formData.other_fee) || 0) + (parseFloat(procedureFee) || 0) - (parseFloat(formData.refund) || 0)).toFixed(0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Confidential Notes Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Confidential Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Private notes visible only to doctors..."
                  value={formData.confidential_notes}
                  onChange={(e) => setFormData({...formData, confidential_notes: e.target.value})}
                  rows={3}
                  className="bg-amber-50 border-amber-200"
                />
              </CardContent>
            </Card>

            {/* Timeline Section - Shopify Style */}
            <AppointmentTimeline
              appointmentId={appointment.id}
              patientId={appointment.patient_id}
              patientName={appointment.patients.full_name}
              doctorId={appointment.doctor_id}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/doctor/appointments")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : existingRecord ? "Update Record" : "Save Visit Record"}
              </Button>
            </div>
          </div>

          {/* Right Column - Patient Sidebar */}
          <div className="space-y-6">
            {/* Patient Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Patient</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                    <Link to={`/doctor/patients/${appointment.patients.id}`}>
                      <Pencil className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Link to={`/doctor/patients/${appointment.patients.id}`} className="text-primary hover:underline font-medium">
                    {appointment.patients.full_name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{appointment.patients.patient_id}</p>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Age:</span> {calculateAge(appointment.patients.date_of_birth)} years</p>
                  <p><span className="text-muted-foreground">Gender:</span> {appointment.patients.gender}</p>
                  {appointment.patients.blood_group && (
                    <p><span className="text-muted-foreground">Blood:</span> {appointment.patients.blood_group}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {appointment.patients.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${appointment.patients.phone}`} className="text-primary hover:underline">
                      {appointment.patients.phone}
                    </a>
                  </div>
                )}
                {appointment.patients.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.patients.email}</span>
                  </div>
                )}
                {appointment.patients.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{appointment.patients.address}</p>
                      {appointment.patients.city && <p>{appointment.patients.city}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pregnancy Tracking - For Gynecologists */}
            {isGynecologist && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pregnancy Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Popover open={pregnancyDatePopoverOpen} onOpenChange={setPregnancyDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !pregnancyStartDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pregnancyStartDate ? format(pregnancyStartDate, "PPP") : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pregnancyStartDate}
                          onSelect={(date) => { setPregnancyStartDate(date); if (date) setPregnancyDatePopoverOpen(false); }}
                          disabled={(date) => {
                            const today = new Date();
                            const maxPast = new Date();
                            maxPast.setDate(maxPast.getDate() - 280);
                            return date > today || date < maxPast;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {pregnancyStartDate && (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium text-primary">{calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium text-primary">
                          {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                            ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PP")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Test Reports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Test Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testTemplates.length > 0 && (
                  <Select value={selectedTestTemplate || "none"} onValueChange={handleTestTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Load template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Select --</SelectItem>
                      {testTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Textarea
                  placeholder="Required tests..."
                  value={formData.test_reports}
                  onChange={(e) => setFormData({...formData, test_reports: e.target.value})}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Next Visit */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Next Visit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !nextVisitDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {nextVisitDate ? format(nextVisitDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={nextVisitDate}
                        onSelect={(date) => { setNextVisitDate(date); if (date) setDatePopoverOpen(false); }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs">Time</Label>
                  <DoctorTimeSelect
                    doctorId={appointment.doctor_id}
                    selectedDate={nextVisitDate}
                    value={nextVisitTime}
                    onValueChange={setNextVisitTime}
                    placeholder="Select time"
                  />
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea
                    placeholder="Follow-up instructions..."
                    value={formData.next_visit_notes}
                    onChange={(e) => setFormData({...formData, next_visit_notes: e.target.value})}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Documents */}
            <PatientMedicalDocsView patientId={appointment.patient_id} />

            {/* Visit History */}
            <VisitHistory patientId={appointment.patient_id} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default DoctorAppointmentDetail;
