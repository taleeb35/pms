import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, Printer } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VisitHistory } from "./VisitHistory";
import { PatientMedicalDocsView } from "./PatientMedicalDocsView";
import { calculatePregnancyDuration, calculateExpectedDueDate } from "@/lib/pregnancyUtils";
import { isTimeSlotAvailable } from "@/lib/appointmentUtils";
import { DoctorTimeSelect } from "./DoctorTimeSelect";

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

interface Appointment {
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

interface VisitRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const VisitRecordDialog = ({ open, onOpenChange, appointment }: VisitRecordDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState<Date>();
  const [nextVisitTime, setNextVisitTime] = useState<string>("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date>();
  const [pregnancyDatePopoverOpen, setPregnancyDatePopoverOpen] = useState(false);
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [isOphthalmologist, setIsOphthalmologist] = useState(false);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<string>("");
  const [procedureFee, setProcedureFee] = useState<string>("");
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([]);
  const [selectedICDCode, setSelectedICDCode] = useState<string>("");
  const [diseaseTemplates, setDiseaseTemplates] = useState<DiseaseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [testTemplates, setTestTemplates] = useState<TestTemplate[]>([]);
  const [selectedTestTemplate, setSelectedTestTemplate] = useState<string>("");
  
  const [formData, setFormData] = useState({
    // Vitals
    blood_pressure: "",
    temperature: "",
    pulse: "",
    weight: "",
    height: "",
    pain_scale: null as number | null,
    right_eye_vision: "",
    left_eye_vision: "",
    
    // Medical Info
    chief_complaint: "",
    patient_history: "",
    current_prescription: "",
    test_reports: "",
    
    // Follow-up
    next_visit_notes: "",
    
    // Financial
    consultation_fee: "",
    other_fee: "",
    refund: "",
    
    // Confidential
    confidential_notes: "",
  });

  const [existingRecord, setExistingRecord] = useState<any>(null);

  const [doctorFee, setDoctorFee] = useState<number | null>(null);

  useEffect(() => {
    if (appointment && open) {
      fetchDoctorFee();
      fetchExistingRecord();
      checkDoctorSpecialization();
      fetchPatientPregnancyDate();
      fetchDiseaseTemplates();
      fetchTestTemplates();
    } else if (!open) {
      // Reset pregnancy date when dialog closes
      setPregnancyStartDate(undefined);
      // Reset procedure selection
      setSelectedProcedure("");
      setProcedureFee("");
      // Reset ICD code selection
      setSelectedICDCode("");
      // Reset disease template selection
      setSelectedTemplate("");
      setDiseaseTemplates([]);
      // Reset test template selection
      setSelectedTestTemplate("");
      setTestTemplates([]);
      // Reset next visit
      setNextVisitDate(undefined);
      setNextVisitTime("");
      // Reset form when dialog closes
      setFormData({
        blood_pressure: "",
        temperature: "",
        pulse: "",
        weight: "",
        height: "",
        pain_scale: null,
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
      setExistingRecord(null);
      setDoctorFee(null);
    }
  }, [appointment, open]);

  const fetchDoctorFee = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctors")
        .select("consultation_fee")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.consultation_fee) {
        setDoctorFee(data.consultation_fee);
      }
    } catch (error) {
      console.error("Error fetching doctor fee:", error);
    }
  };

  // Apply doctor fee when we know there's no existing record
  useEffect(() => {
    if (doctorFee && !existingRecord && !formData.consultation_fee) {
      setFormData(prev => ({
        ...prev,
        consultation_fee: doctorFee.toString()
      }));
    }
  }, [doctorFee, existingRecord]);

  const checkDoctorSpecialization = async () => {
    try {
      if (!appointment) return;

      // Use the appointment's doctor_id to fetch specialization and procedures
      // This allows clinic owners and receptionists to see the correct procedures
      const doctorId = appointment.doctor_id;

      const { data, error } = await supabase
        .from("doctors")
        .select("specialization, consultation_fee, clinic_id")
        .eq("id", doctorId)
        .maybeSingle();

      if (error) throw error;
      
      const spec = data?.specialization?.toLowerCase() || "";
      setIsGynecologist(spec.includes("gynecologist"));
      setIsOphthalmologist(spec.includes("ophthalmologist"));
      
      // Set doctor fee if available and no existing record
      if (data?.consultation_fee && !existingRecord && !formData.consultation_fee) {
        setDoctorFee(data.consultation_fee);
      }
      
      // Fetch procedures for the appointment's doctor
      fetchProcedures(doctorId);
      
      // Fetch ICD codes for the clinic
      if (data?.clinic_id) {
        fetchICDCodes(data.clinic_id);
      }
    } catch (error) {
      console.error("Error checking doctor specialization:", error);
    }
  };

  const fetchProcedures = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("name");

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error("Error fetching procedures:", error);
    }
  };

  const fetchICDCodes = async (clinicId: string) => {
    try {
      const { data, error } = await supabase
        .from("clinic_icd_codes")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("code");

      if (error) throw error;
      setIcdCodes(data || []);
    } catch (error) {
      console.error("Error fetching ICD codes:", error);
    }
  };

  const fetchDiseaseTemplates = async () => {
    if (!appointment) return;
    try {
      const { data, error } = await supabase
        .from("doctor_disease_templates")
        .select("id, disease_name, prescription_template")
        .eq("doctor_id", appointment.doctor_id)
        .order("disease_name");

      if (error) throw error;
      setDiseaseTemplates(data || []);
    } catch (error) {
      console.error("Error fetching disease templates:", error);
    }
  };

  const fetchTestTemplates = async () => {
    if (!appointment) return;
    try {
      const { data, error } = await supabase
        .from("doctor_test_templates")
        .select("id, title, description")
        .eq("doctor_id", appointment.doctor_id)
        .order("title");

      if (error) throw error;
      setTestTemplates(data || []);
    } catch (error) {
      console.error("Error fetching test templates:", error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId && templateId !== "none") {
      const template = diseaseTemplates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          current_prescription: template.prescription_template
        }));
      }
    }
  };

  const handleProcedureChange = (procedureId: string) => {
    setSelectedProcedure(procedureId);
    const procedure = procedures.find(p => p.id === procedureId);
    if (procedure) {
      setProcedureFee(procedure.price.toString());
    } else {
      setProcedureFee("");
    }
  };

  const handleTestTemplateChange = (templateId: string) => {
    setSelectedTestTemplate(templateId);
    if (templateId && templateId !== "none") {
      const template = testTemplates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          test_reports: template.description
        }));
      }
    }
  };

  const fetchPatientPregnancyDate = async () => {
    if (!appointment) return;

    // Reset first to ensure clean state for each patient
    setPregnancyStartDate(undefined);

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("pregnancy_start_date")
        .eq("id", appointment.patient_id)
        .single();

      if (error) throw error;

      if (data?.pregnancy_start_date) {
        setPregnancyStartDate(new Date(data.pregnancy_start_date));
      } else {
        setPregnancyStartDate(undefined);
      }
    } catch (error) {
      console.error("Error fetching pregnancy date:", error);
      setPregnancyStartDate(undefined);
    }
  };

  const fetchExistingRecord = async () => {
    if (!appointment) return;

    const { data, error } = await supabase
      .from("visit_records")
      .select("*")
      .eq("appointment_id", appointment.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching visit record:", error);
      return;
    }

    if (data) {
      setExistingRecord(data);
      
      // Fetch appointment fees and procedure
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("consultation_fee, other_fee, procedure_id, procedure_fee, confidential_notes, icd_code_id, refund")
        .eq("id", appointment.id)
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
      
      // Load saved procedure if exists
      if (appointmentData?.procedure_id) {
        setSelectedProcedure(appointmentData.procedure_id);
        setProcedureFee(appointmentData.procedure_fee?.toString() || "");
      }
      
      // Load saved ICD code if exists
      if (appointmentData?.icd_code_id) {
        setSelectedICDCode(appointmentData.icd_code_id);
      }
      
      if (data.next_visit_date) {
        setNextVisitDate(new Date(data.next_visit_date));
      }
    }
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrint = async () => {
    // Create a clean print document
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get patient info
    const patientName = appointment?.patients?.full_name || '';
    const patientId = appointment?.patients?.patient_id || '';
    const patientAge = appointment?.patients?.date_of_birth ? calculateAge(appointment.patients.date_of_birth) : '';
    const visitDate = appointment?.appointment_date ? format(new Date(appointment.appointment_date), "dd MMMM yyyy") : '';
    
    // Build HTML content for print - compact layout for single page with letterhead space
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient Visit Record</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { 
            margin: 3.5cm 1.5cm 2.5cm 1.5cm;
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Nunito', 'Segoe UI', sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: #222;
          }
          
          /* Header with date */
          .print-header {
            text-align: right;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 1px solid #ccc;
          }
          .print-date {
            font-size: 9pt;
            color: #444;
          }
          
          /* Patient Info - Inline */
          .patient-info {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
            padding: 8px 10px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .patient-item {
            display: flex;
            gap: 6px;
          }
          .patient-label {
            font-size: 8pt;
            color: #666;
            text-transform: uppercase;
          }
          .patient-value {
            font-size: 9pt;
            font-weight: 600;
          }
          
          /* Vitals Section */
          .vitals-section {
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 9pt;
            font-weight: 700;
            color: #333;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .vitals-grid {
            display: flex;
            gap: 8px;
          }
          .vital-box {
            flex: 1;
            text-align: center;
            padding: 6px 4px;
            background: #fafafa;
            border: 1px solid #ddd;
            border-radius: 3px;
          }
          .vital-label {
            font-size: 7pt;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 2px;
          }
          .vital-value {
            font-size: 10pt;
            font-weight: 600;
          }
          
          /* Content Sections */
          .content-section {
            margin-bottom: 8px;
          }
          .content-title {
            font-size: 8pt;
            font-weight: 700;
            color: #444;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .content-box {
            padding: 6px 8px;
            background: #fafafa;
            border-left: 2px solid #333;
            font-size: 9pt;
            line-height: 1.4;
            white-space: pre-wrap;
          }
          
          /* Prescription Box */
          .prescription-box {
            padding: 8px 10px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
            font-size: 9pt;
            line-height: 1.5;
            white-space: pre-wrap;
          }
          .prescription-title {
            color: #92400e;
          }
          
          /* Next Visit Section */
          .next-visit-section {
            margin-top: 10px;
            padding: 8px 10px;
            background: #ecfdf5;
            border: 1px solid #6ee7b7;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .next-visit-label {
            font-size: 8pt;
            font-weight: 700;
            color: #065f46;
            text-transform: uppercase;
          }
          .next-visit-date {
            font-size: 10pt;
            font-weight: 700;
            color: #047857;
          }
          .next-visit-notes {
            font-size: 8pt;
            color: #065f46;
          }
          
          /* Footer */
          .print-footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: right;
          }
          .signature-line {
            display: inline-block;
            width: 150px;
            border-top: 1px solid #333;
            padding-top: 4px;
            font-size: 8pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <!-- Header with Date -->
        <div class="print-header">
          <span class="print-date">Date: ${visitDate}</span>
        </div>
        
        <!-- Patient Information - Compact Inline -->
        <div class="patient-info">
          <div class="patient-item">
            <span class="patient-label">Name:</span>
            <span class="patient-value">${patientName}</span>
          </div>
          <div class="patient-item">
            <span class="patient-label">ID:</span>
            <span class="patient-value">${patientId}</span>
          </div>
          <div class="patient-item">
            <span class="patient-label">Age:</span>
            <span class="patient-value">${patientAge} Yrs</span>
          </div>
        </div>
        
        <!-- Vitals Section -->
        <div class="vitals-section">
          <div class="section-title">Vitals</div>
          <div class="vitals-grid">
            <div class="vital-box">
              <div class="vital-label">BP</div>
              <div class="vital-value">${formData.blood_pressure || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Temp</div>
              <div class="vital-value">${formData.temperature || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Pulse</div>
              <div class="vital-value">${formData.pulse || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Weight</div>
              <div class="vital-value">${formData.weight || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Height</div>
              <div class="vital-value">${formData.height || '—'}</div>
            </div>
            <div class="vital-box">
              <div class="vital-label">Pain</div>
              <div class="vital-value">${formData.pain_scale ? formData.pain_scale + '/10' : '—'}</div>
            </div>
          </div>
        </div>
    `;
    
    // Add chief complaint
    if (formData.chief_complaint) {
      printContent += `
        <div class="content-section">
          <div class="content-title">Chief Complaint</div>
          <div class="content-box">${formData.chief_complaint}</div>
        </div>
      `;
    }
    
    // Add current prescription with special styling
    if (formData.current_prescription) {
      printContent += `
        <div class="content-section">
          <div class="content-title prescription-title">℞ Prescription</div>
          <div class="prescription-box">${formData.current_prescription}</div>
        </div>
      `;
    }
    
    // Add test reports
    if (formData.test_reports) {
      printContent += `
        <div class="content-section">
          <div class="content-title">Test Reports / Investigations</div>
          <div class="content-box">${formData.test_reports}</div>
        </div>
      `;
    }
    
    // Add next visit info
    if (nextVisitDate || formData.next_visit_notes) {
      printContent += `
        <div class="next-visit-section">
          <span class="next-visit-label">Next Visit:</span>
      `;
      if (nextVisitDate) {
        printContent += `<span class="next-visit-date">${format(nextVisitDate, "EEEE, dd MMMM yyyy")}</span>`;
      }
      if (formData.next_visit_notes) {
        printContent += `<span class="next-visit-notes">${formData.next_visit_notes}</span>`;
      }
      printContent += `</div>`;
    }
    
    // Add footer with signature line
    printContent += `
        <div class="print-footer">
          <div class="signature-line">Doctor's Signature</div>
        </div>
      </body>
      </html>
    `;
    
    // Write content to new window and print
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for fonts to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const visitData = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id, // Use the appointment's doctor_id, not the logged-in user
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
        ({ error } = await supabase
          .from("visit_records")
          .update(visitData)
          .eq("id", existingRecord.id));
      } else {
        ({ error } = await supabase
          .from("visit_records")
          .insert([visitData]));
      }

      if (error) throw error;

      // Update appointment fees
      const consultationFee = formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0;
      const otherFee = formData.other_fee ? parseFloat(formData.other_fee) : 0;
      const procFee = procedureFee ? parseFloat(procedureFee) : 0;
      const refundAmount = formData.refund ? parseFloat(formData.refund) : 0;
      const totalFee = consultationFee + otherFee + procFee - refundAmount;

      const appointmentUpdate: any = {
        consultation_fee: consultationFee,
        other_fee: otherFee,
        refund: refundAmount,
        status: 'completed',
        confidential_notes: formData.confidential_notes || null,
        icd_code_id: selectedICDCode || null,
      };

      // Add procedure info
      if (selectedProcedure) {
        appointmentUpdate.procedure_id = selectedProcedure;
        appointmentUpdate.procedure_fee = procedureFee ? parseFloat(procedureFee) : 0;
      }

      const { error: feeError } = await supabase
        .from("appointments")
        .update(appointmentUpdate)
        .eq("id", appointment.id);

      if (feeError) throw feeError;

      // Update pregnancy start date if gynecologist
      if (isGynecologist && pregnancyStartDate) {
        const { error: pregnancyError } = await supabase
          .from("patients")
          .update({ pregnancy_start_date: format(pregnancyStartDate, "yyyy-MM-dd") })
          .eq("id", appointment.patient_id);

        if (pregnancyError) {
          console.error("Error updating pregnancy date:", pregnancyError);
        }
      }

      // Create new appointment if next visit date is set
      if (nextVisitDate) {
        const followUpDate = format(nextVisitDate, "yyyy-MM-dd");
        const followUpTime = nextVisitTime || appointment.appointment_time;

        // Check for double booking for follow-up
        const { available } = await isTimeSlotAvailable(
          appointment.doctor_id,
          followUpDate,
          followUpTime
        );

        if (!available) {
          toast({
            title: "Warning",
            description: "Visit record saved but the follow-up time slot is already booked. Please schedule manually.",
            variant: "destructive",
          });
        } else {
          const { error: appointmentError } = await supabase
            .from("appointments")
            .insert({
              patient_id: appointment.patient_id,
              doctor_id: appointment.doctor_id,
              appointment_date: followUpDate,
              appointment_time: followUpTime,
              duration_minutes: 30,
              status: "scheduled",
              reason: "Follow-up visit",
              notes: formData.next_visit_notes || null,
            });

          if (appointmentError) {
            console.error("Error creating follow-up appointment:", appointmentError);
            toast({
              title: "Warning",
              description: "Visit record saved but failed to create follow-up appointment",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: `Visit record ${existingRecord ? 'updated' : 'saved'} successfully${nextVisitDate ? ' and follow-up appointment created' : ''}`,
      });

      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-full">
        {!appointment ? (
          <div className="p-8 text-center text-muted-foreground">
            No appointment selected
          </div>
        ) : (
          <>
            <DialogHeader className="print:hidden">
              <DialogTitle className="flex items-center justify-between">
                <span>Patient Visit Record</span>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </DialogTitle>
            </DialogHeader>

            {/* Patient Info Header */}
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-semibold">{appointment.patients.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold">{appointment.patients.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{calculateAge(appointment.patients.date_of_birth)} years</p>
                </div>
              </div>
              {isGynecologist && pregnancyStartDate && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pregnancy Duration</p>
                    <p className="font-semibold text-primary">
                      {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Due Date</p>
                    <p className="font-semibold text-primary">
                      {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                        ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                        : "-"}
                    </p>
                  </div>
                </div>
              )}
            </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Vitals Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Vitals</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Blood Pressure</Label>
                    <Input
                      placeholder="120/80"
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({...formData, blood_pressure: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Temperature</Label>
                    <Input
                      placeholder="98.6°F"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Pulse</Label>
                    <Input
                      placeholder="72 bpm"
                      value={formData.pulse}
                      onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Height (cm)</Label>
                    <Input
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      type="number"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>BMI</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted flex items-center">
                      {(() => {
                        const weight = parseFloat(formData.weight);
                        const heightCm = parseFloat(formData.height);
                        if (weight > 0 && heightCm > 0) {
                          const heightM = heightCm / 100;
                          const bmi = weight / (heightM * heightM);
                          const bmiValue = bmi.toFixed(1);
                          let bmiCategory = "";
                          let bmiColor = "";
                          if (bmi < 18.5) {
                            bmiCategory = "Underweight";
                            bmiColor = "text-blue-600";
                          } else if (bmi < 25) {
                            bmiCategory = "Normal";
                            bmiColor = "text-green-600";
                          } else if (bmi < 30) {
                            bmiCategory = "Overweight";
                            bmiColor = "text-amber-600";
                          } else {
                            bmiCategory = "Obese";
                            bmiColor = "text-red-600";
                          }
                          return (
                            <span className={cn("font-medium", bmiColor)}>
                              {bmiValue} ({bmiCategory})
                            </span>
                          );
                        }
                        return <span className="text-muted-foreground">-</span>;
                      })()}
                    </div>
                  </div>
                  {isOphthalmologist ? (
                    <>
                      <div>
                        <Label>Right Eye Vision</Label>
                        <Input
                          placeholder="e.g., 6/6, 20/20"
                          value={formData.right_eye_vision}
                          onChange={(e) => setFormData({...formData, right_eye_vision: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Left Eye Vision</Label>
                        <Input
                          placeholder="e.g., 6/6, 20/20"
                          value={formData.left_eye_vision}
                          onChange={(e) => setFormData({...formData, left_eye_vision: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3">
                      <Label>Pain Scale (1-10)</Label>
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
                          "w-16 h-10 rounded-md border flex items-center justify-center font-bold text-lg",
                          formData.pain_scale === null && "bg-muted text-muted-foreground",
                          formData.pain_scale && formData.pain_scale <= 3 && "bg-green-100 text-green-700 border-green-300",
                          formData.pain_scale && formData.pain_scale > 3 && formData.pain_scale <= 6 && "bg-amber-100 text-amber-700 border-amber-300",
                          formData.pain_scale && formData.pain_scale > 6 && "bg-red-100 text-red-700 border-red-300"
                        )}>
                          {formData.pain_scale || "-"}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>No Pain</span>
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Chief Complaint</h3>
                <Textarea
                  placeholder="Patient's main complaint or reason for visit..."
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})}
                  rows={3}
                />
              </div>

              {/* ICD Code Selection */}
              {icdCodes.length > 0 && (
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold mb-4">Diagnosis (ICD Code)</h3>
                  <Select value={selectedICDCode || "none"} onValueChange={(val) => setSelectedICDCode(val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ICD code (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="none">No ICD Code</SelectItem>
                      {icdCodes.map((icd) => (
                        <SelectItem key={icd.id} value={icd.id}>
                          <span className="font-mono font-medium">{icd.code}</span> - {icd.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedICDCode && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {icdCodes.find(i => i.id === selectedICDCode)?.code} - {icdCodes.find(i => i.id === selectedICDCode)?.description}
                    </p>
                  )}
                </div>
              )}

              {/* Current Prescription */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Current Prescription</h3>
                {diseaseTemplates.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground">Load from Disease Template</Label>
                    <Select value={selectedTemplate || "none"} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a disease template..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">-- Select Template --</SelectItem>
                        {diseaseTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.disease_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Textarea
                  placeholder="Medications, dosage, and instructions..."
                  value={formData.current_prescription}
                  onChange={(e) => setFormData({...formData, current_prescription: e.target.value})}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Right Column - History & Future */}
            <div className="space-y-6">
              {/* Medical Records & Documents */}
              {appointment && <PatientMedicalDocsView patientId={appointment.patient_id} />}
              
              {/* Visit History */}
              {appointment && <VisitHistory patientId={appointment.patient_id} />}

              {/* Pregnancy Start Date - Only for Gynecologists */}
              {isGynecologist && (
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h3 className="font-semibold mb-4">Pregnancy Tracking</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Pregnancy Start Date</Label>
                      <Popover open={pregnancyDatePopoverOpen} onOpenChange={setPregnancyDatePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !pregnancyStartDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {pregnancyStartDate ? format(pregnancyStartDate, "PPP") : "Set start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={pregnancyStartDate}
                            onSelect={(date) => {
                              setPregnancyStartDate(date);
                              if (date) setPregnancyDatePopoverOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              const maxPastDate = new Date();
                              maxPastDate.setDate(maxPastDate.getDate() - 280); // 9 months = 280 days
                              return date > today || date < maxPastDate;
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground mt-1">
                        Can only select dates within the last 9 months (280 days)
                      </p>
                    </div>
                    {pregnancyStartDate && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold text-primary">
                            {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expected Due Date:</span>
                          <span className="font-semibold text-primary">
                            {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                              ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                              : "-"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Reports */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Test Reports</h3>
                {testTemplates.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground">Load from Test Template</Label>
                    <Select value={selectedTestTemplate || "none"} onValueChange={handleTestTemplateChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a test template..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">-- Select Template --</SelectItem>
                        {testTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Textarea
                  placeholder="Required tests, lab reports, imaging..."
                  value={formData.test_reports}
                  onChange={(e) => setFormData({...formData, test_reports: e.target.value})}
                  rows={6}
                  className="text-sm"
                />
              </div>

              {/* Future Visit */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Future Visit</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Next Visit Date</Label>
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !nextVisitDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {nextVisitDate ? format(nextVisitDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={nextVisitDate}
                          onSelect={(date) => {
                            setNextVisitDate(date);
                            if (date) setDatePopoverOpen(false);
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Next Visit Time</Label>
                    <DoctorTimeSelect
                      doctorId={appointment?.doctor_id || ""}
                      selectedDate={nextVisitDate}
                      value={nextVisitTime}
                      onValueChange={setNextVisitTime}
                      placeholder="Select time"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Follow-up instructions..."
                      value={formData.next_visit_notes}
                      onChange={(e) => setFormData({...formData, next_visit_notes: e.target.value})}
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Confidential Notes Section - Doctor Only */}
              <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold mb-4 text-amber-800 dark:text-amber-200">Confidential Notes (Doctor Only)</h3>
                <Textarea
                  placeholder="Private notes visible only to doctors..."
                  value={formData.confidential_notes}
                  onChange={(e) => setFormData({...formData, confidential_notes: e.target.value})}
                  rows={3}
                  className="text-sm"
                />
              </div>

              {/* Financial Section */}
              <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold mb-4">Financial Details</h3>
                <div className="space-y-4">
                  {/* Procedure Selection */}
                  {procedures.length > 0 && (
                    <div>
                      <Label>Select Procedure</Label>
                      <Select value={selectedProcedure || "none"} onValueChange={(val) => handleProcedureChange(val === "none" ? "" : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a procedure (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Procedure</SelectItem>
                          {procedures.map((proc) => (
                            <SelectItem key={proc.id} value={proc.id}>
                              {proc.name} - {proc.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedProcedure && (
                    <div>
                      <Label>Procedure Fee</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={procedureFee}
                        onChange={(e) => setProcedureFee(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  <div>
                    <Label>Consultation Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Other Fee</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.other_fee}
                      onChange={(e) => setFormData({...formData, other_fee: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label>Refund</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.refund}
                      onChange={(e) => setFormData({...formData, refund: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {(formData.consultation_fee || formData.other_fee || procedureFee || formData.refund) && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Fee:</span>
                        <span className="text-lg text-green-600 dark:text-green-400">
                          {((parseFloat(formData.consultation_fee) || 0) + (parseFloat(formData.other_fee) || 0) + (parseFloat(procedureFee) || 0) - (parseFloat(formData.refund) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : existingRecord ? "Update Record" : "Save Record"}
            </Button>
          </div>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
