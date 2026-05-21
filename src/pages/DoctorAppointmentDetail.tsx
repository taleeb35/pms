import { useState, useEffect, useRef } from "react";
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
import { CalendarIcon, Printer, ChevronUp, ChevronDown, MoreHorizontal, Phone, Mail, MapPin, User, FileText, Clock, CheckCircle, XCircle, Play, Pencil, Loader2 } from "lucide-react";
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
import { AIPrescriptionAssistant } from "@/components/AIPrescriptionAssistant";
import { printAppointmentInvoice } from "@/lib/printAppointmentInvoice";
import { printAppointmentPrescription } from "@/lib/printAppointmentPrescription";
import { Receipt } from "lucide-react";
import { AIVisitSummary } from "@/components/AIVisitSummary";
import StartVideoConsultation from "@/components/StartVideoConsultation";
import OphthalmologyExamination, { OphthalmologyData } from "@/components/OphthalmologyExamination";
import { PrintReportDialog } from "@/components/PrintReportDialog";
import { FileBarChart } from "lucide-react";

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
  source: string | null;
  lead_status: string | null;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string | null;
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

// Module-level in-memory cache so switching between appointments is instant.
// Persists for the life of the SPA session (cleared on full reload).
type CachedSnapshot = {
  appointment: any;
  appointmentNumber: number;
  prevId: string | null;
  nextId: string | null;
  formData: any;
  existingRecord: any;
  selectedProcedure: string;
  procedureFee: string;
  selectedICDCode: string;
  pregnancyStartDate: string | null; // ISO string
  nextVisitDate: string | null; // ISO string
  isGynecologist: boolean;
  isOphthalmologist: boolean;
  procedures: Procedure[];
  icdCodes: ICDCode[];
  diseaseTemplates: DiseaseTemplate[];
  testTemplates: TestTemplate[];
  ophthalmologyData: OphthalmologyData;
  cachedAt: number;
};
const appointmentCache = new Map<string, CachedSnapshot>();
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 min — still revalidate in background

const DoctorAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [appointmentNumber, setAppointmentNumber] = useState<number>(0);
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [existingRecord, setExistingRecord] = useState<any>(null);
  
  // Doctor specialization
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [isOphthalmologist, setIsOphthalmologist] = useState(false);
  const [ophthalmologyData, setOphthalmologyData] = useState<OphthalmologyData>({});
  
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
  const [stagedMedicines, setStagedMedicines] = useState<Array<{ medicine_name: string; brand?: string | null; dosage?: string | null; frequency?: string | null; timing: string[]; duration?: string | null; meal?: string | null; instructions?: string | null }>>([]);
  
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

  // Track latest state for cache snapshots without re-running effects
  const stateRef = useRef<any>({});
  stateRef.current = {
    appointment, appointmentNumber, prevId, nextId, formData, existingRecord,
    selectedProcedure, procedureFee, selectedICDCode,
    pregnancyStartDate, nextVisitDate,
    isGynecologist, isOphthalmologist,
    procedures, icdCodes, diseaseTemplates, testTemplates, ophthalmologyData,
  };

  // Hydrate from cache synchronously when id changes — instant tab switching
  const hydrateFromCache = (snap: CachedSnapshot) => {
    setAppointment(snap.appointment);
    setAppointmentNumber(snap.appointmentNumber);
    setPrevId(snap.prevId);
    setNextId(snap.nextId);
    setFormData(snap.formData);
    setExistingRecord(snap.existingRecord);
    setSelectedProcedure(snap.selectedProcedure);
    setProcedureFee(snap.procedureFee);
    setSelectedICDCode(snap.selectedICDCode);
    setPregnancyStartDate(snap.pregnancyStartDate ? new Date(snap.pregnancyStartDate) : undefined);
    setNextVisitDate(snap.nextVisitDate ? new Date(snap.nextVisitDate) : undefined);
    setIsGynecologist(snap.isGynecologist);
    setIsOphthalmologist(snap.isOphthalmologist);
    setProcedures(snap.procedures);
    setIcdCodes(snap.icdCodes);
    // Templates can change outside the appointment screen, so always refetch them.
    setDiseaseTemplates([]);
    setTestTemplates([]);
    setOphthalmologyData(snap.ophthalmologyData || {});
  };

  const writeCache = (aptId: string) => {
    const s = stateRef.current;
    if (!s.appointment) return;
    appointmentCache.set(aptId, {
      appointment: s.appointment,
      appointmentNumber: s.appointmentNumber,
      prevId: s.prevId,
      nextId: s.nextId,
      formData: s.formData,
      existingRecord: s.existingRecord,
      selectedProcedure: s.selectedProcedure,
      procedureFee: s.procedureFee,
      selectedICDCode: s.selectedICDCode,
      pregnancyStartDate: s.pregnancyStartDate ? s.pregnancyStartDate.toISOString() : null,
      nextVisitDate: s.nextVisitDate ? s.nextVisitDate.toISOString() : null,
      isGynecologist: s.isGynecologist,
      isOphthalmologist: s.isOphthalmologist,
      procedures: s.procedures,
      icdCodes: s.icdCodes,
      diseaseTemplates: s.diseaseTemplates,
      testTemplates: s.testTemplates,
      ophthalmologyData: s.ophthalmologyData || {},
      cachedAt: Date.now(),
    });
  };

  useEffect(() => {
    if (!id) return;
    const cached = appointmentCache.get(id);
    if (cached?.appointment?.source === "public_profile") {
      appointmentCache.delete(id);
      fetchAppointmentDetails(false);
      return;
    }
    if (cached) {
      hydrateFromCache(cached);
      setLoading(false);
      if (cached.appointment?.doctor_id) {
        fetchDiseaseTemplates(cached.appointment.doctor_id);
        fetchTestTemplates(cached.appointment.doctor_id);
      }
      // Stale-while-revalidate: refresh in background only if cache is older than 30s
      if (Date.now() - cached.cachedAt > 30 * 1000) {
        fetchAppointmentDetails(true);
      } else {
        // Still prefetch neighbors
        prefetchNeighbors(cached.prevId, cached.nextId);
      }
    } else {
      fetchAppointmentDetails(false);
    }
  }, [id]);

  const prefetchNeighbors = async (pId: string | null, nId: string | null) => {
    [pId, nId].forEach((nid) => {
      if (nid && !appointmentCache.has(nid)) {
        // Fire-and-forget warm fetch (just the appointment row) so the cache
        // entry exists with at least core data; full snapshot fills on visit.
        supabase
          .from("appointments")
          .select(`*, patients(id, full_name, patient_id, date_of_birth, phone, email, gender, address, city, blood_group, pregnancy_start_date, allergies, major_diseases)`)
          .eq("id", nid)
          .single()
          .then(({ data }) => {
            if (data && !appointmentCache.has(nid)) {
              // Store a minimal placeholder; full snapshot will overwrite on actual visit.
              // We DON'T set cachedAt so it's always considered stale and refetched.
              appointmentCache.set(nid, {
                appointment: data,
                appointmentNumber: 0,
                prevId: null, nextId: null,
                formData: stateRef.current.formData,
                existingRecord: null,
                selectedProcedure: "", procedureFee: "",
                selectedICDCode: "",
                pregnancyStartDate: null, nextVisitDate: null,
                isGynecologist: false, isOphthalmologist: false,
                procedures: [], icdCodes: [],
                diseaseTemplates: [], testTemplates: [], ophthalmologyData: {},
                cachedAt: 0,
              });
            }
          });
      }
    });
  };

  const fetchAppointmentDetails = async (background = false) => {
    if (!background) setLoading(true);
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
        .neq("source", "public_profile")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        if (!background) {
          toast({
            title: "Not an appointment",
            description: "Public profile leads are no longer shown inside Appointments.",
            variant: "destructive",
          });
          navigate("/doctor/appointments");
        }
        return;
      }
      setAppointment(data);

      // Fire all secondary queries in parallel — none depend on each other
      const [
        countRes,
        prevRes,
        nextRes,
        existingRecordResult,
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", data.doctor_id)
          .neq("source", "public_profile")
          .lte("created_at", data.created_at),
        supabase
          .from("appointments")
          .select("id")
          .eq("doctor_id", data.doctor_id)
          .neq("source", "public_profile")
          .lt("created_at", data.created_at)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("appointments")
          .select("id")
          .eq("doctor_id", data.doctor_id)
          .neq("source", "public_profile")
          .gt("created_at", data.created_at)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        fetchExistingRecord(data.id),
      ]);

      if (!countRes.error && countRes.count !== null) {
        setAppointmentNumber(1000 + countRes.count);
      }
      const newPrev = prevRes.data?.id ?? null;
      const newNext = nextRes.data?.id ?? null;
      setPrevId(newPrev);
      setNextId(newNext);

      // Fetch related data in parallel (independent of above)
      await Promise.all([
        checkDoctorSpecialization(data.doctor_id, !!existingRecordResult),
        fetchPatientPregnancyDate(data.patient_id),
        fetchDiseaseTemplates(data.doctor_id),
        fetchTestTemplates(data.doctor_id),
      ]);

      // Persist snapshot for instant re-entry & prefetch neighbors
      // Defer slightly so React state has flushed
      setTimeout(() => {
        if (id) writeCache(id);
        prefetchNeighbors(newPrev, newNext);
      }, 0);
    } catch (error: any) {
      console.error("Error fetching appointment:", error);
      if (!background) {
        toast({ title: "Error", description: "Failed to load appointment details", variant: "destructive" });
        navigate("/doctor/appointments");
      }
    } finally {
      if (!background) setLoading(false);
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
      setIsOphthalmologist(spec.includes("ophthal") || spec.includes("eye surgeon") || spec.includes("eye specialist") || spec === "eye doctor");

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
      const { data, error } = await supabase
        .from("doctor_disease_templates")
        .select("id, disease_name, prescription_template, doctor_id")
        .order("disease_name");

      if (error) throw error;

      const uniqueTemplates = (data || [])
        .filter((template, index, self) => index === self.findIndex(t => t.id === template.id))
        .map(({ doctor_id, ...template }) => ({
          ...template,
          disease_name: doctor_id === doctorId ? template.disease_name : `${template.disease_name} (Clinic)`,
        }));

      setDiseaseTemplates(uniqueTemplates);
    } catch (error) {
      console.error("Error fetching disease templates:", error);
    }
  };

  const fetchTestTemplates = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from("doctor_test_templates")
        .select("id, title, description, doctor_id")
        .order("title");

      if (error) throw error;

      const uniqueTemplates = (data || [])
        .filter((template, index, self) => index === self.findIndex(t => t.id === template.id))
        .map(({ doctor_id, ...template }) => ({
          ...template,
          title: doctor_id === doctorId ? template.title : `${template.title} (Clinic)`,
        }));

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

  const fetchExistingRecord = async (appointmentId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("visit_records")
      .select("*")
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching visit record:", error);
      return false;
    }

    if (data) {
      setExistingRecord(data);

      // Fetch appointment fees + patient-level confidential notes (lives on the patient profile)
      const [{ data: appointmentData }, { data: patientData }] = await Promise.all([
        supabase
          .from("appointments")
          .select("consultation_fee, other_fee, procedure_id, procedure_fee, icd_code_id, refund, patient_id")
          .eq("id", appointmentId)
          .single(),
        supabase
          .from("patients")
          .select("confidential_notes")
          .eq("id", (appointment?.patient_id ?? data.patient_id))
          .maybeSingle(),
      ]);

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
        confidential_notes: (patientData as any)?.confidential_notes || "",
      });

      setOphthalmologyData((data as any).ophthalmology_data || {});

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
      return true;
    }
    return false;
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "start": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    if (templateId && templateId !== "none") {
      const template = diseaseTemplates.find(t => t.id === templateId);
      if (template) {
        // Load structured medicines for this template
        const { loadTemplateMedicines, formatMedicinesAsText } = await import("@/components/DiseaseTemplateMedicineEditor");
        const meds = await loadTemplateMedicines(templateId);
        const structuredText = formatMedicinesAsText(meds, template.prescription_template);
        const block = structuredText || template.prescription_template;

        // Stage structured medicines for saving on submit (for medicine reporting)
        setStagedMedicines(prev => [...prev, ...meds]);

        setFormData(prev => {
          const existing = (prev.current_prescription || "").trim();
          const header = `--- ${template.disease_name} ---`;
          const next = existing
            ? `${existing}\n\n${header}\n${block}`
            : `${header}\n${block}`;
          return { ...prev, current_prescription: next };
        });
      }
    }
    // Reset so the same or another template can be picked again
    setSelectedTemplate("");
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

  const handleStatusChange = async (newStatus: "scheduled" | "start" | "completed" | "cancelled") => {
    if (!appointment) return;
    if (id) appointmentCache.delete(id);
    
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "start") {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("appointments")
        .update(updateData as any)
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
    if (!appointment) return;
    const icd = icdCodes.find((c) => c.id === selectedICDCode);
    const docName = (appointment as any)?.doctors?.profiles?.full_name;
    const docSpec = (appointment as any)?.doctors?.specialization;
    printAppointmentPrescription({
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        appointment_type: appointment.appointment_type,
        doctor_id: appointment.doctor_id,
      },
      patient: {
        full_name: appointment.patients.full_name,
        patient_id: appointment.patients.patient_id,
        date_of_birth: appointment.patients.date_of_birth,
        gender: appointment.patients.gender,
        phone: appointment.patients.phone,
        address: appointment.patients.address,
        city: appointment.patients.city,
      },
      vitals: {
        blood_pressure: formData.blood_pressure,
        temperature: formData.temperature,
        pulse: formData.pulse,
        weight: formData.weight,
        height: formData.height,
        pain_scale: formData.pain_scale,
        right_eye_vision: formData.right_eye_vision,
        left_eye_vision: formData.left_eye_vision,
      },
      clinical: {
        chief_complaint: formData.chief_complaint,
        patient_history: formData.patient_history,
        current_prescription: formData.current_prescription,
        test_reports: formData.test_reports,
        next_visit_notes: formData.next_visit_notes,
        next_visit_date: nextVisitDate ? format(nextVisitDate, "yyyy-MM-dd") : null,
        icd_code: (icd as any)?.code || null,
        icd_description: icd?.description || null,
      },
      doctorName: docName,
      doctorSpecialization: docSpec,
    });
  };

  const handlePrintInvoice = () => {
    if (!appointment) return;
    const procName = procedures.find((p) => p.id === selectedProcedure)?.name || null;
    printAppointmentInvoice({
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        appointment_type: appointment.appointment_type,
        doctor_id: appointment.doctor_id,
      },
      patient: {
        full_name: appointment.patients.full_name,
        patient_id: appointment.patients.patient_id,
        date_of_birth: appointment.patients.date_of_birth,
        gender: appointment.patients.gender,
        phone: appointment.patients.phone,
        address: appointment.patients.address,
        city: appointment.patients.city,
      },
      vitals: {
        blood_pressure: formData.blood_pressure,
        temperature: formData.temperature,
        pulse: formData.pulse,
        weight: formData.weight,
        height: formData.height,
        pain_scale: formData.pain_scale,
        right_eye_vision: formData.right_eye_vision,
        left_eye_vision: formData.left_eye_vision,
      },
      fees: {
        consultation_fee: formData.consultation_fee,
        procedure_fee: procedureFee,
        procedure_name: procName,
        other_fee: formData.other_fee,
        refund: formData.refund,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    // Invalidate cache so subsequent visits re-fetch fresh data
    if (id) appointmentCache.delete(id);

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
        ophthalmology_data: ophthalmologyData as any,
      } as any;

      let error;
      if (existingRecord) {
        ({ error } = await supabase.from("visit_records").update(visitData).eq("id", existingRecord.id));
      } else {
        ({ error } = await supabase.from("visit_records").insert([visitData]));
      }

      if (error) throw error;

      // Save structured prescribed medicines for reporting
      if (stagedMedicines.length > 0) {
        await supabase
          .from("appointment_prescribed_medicines")
          .delete()
          .eq("appointment_id", appointment.id);
        const rows = stagedMedicines
          .filter(m => m.medicine_name && m.medicine_name.trim())
          .map(m => {
            const dur = (m.duration || "").trim();
            const m1 = dur.match(/(\d+)\s*day/i);
            const m2 = dur.match(/(\d+)\s*week/i);
            const m3 = dur.match(/(\d+)\s*month/i);
            const days = m1 ? parseInt(m1[1]) : m2 ? parseInt(m2[1]) * 7 : m3 ? parseInt(m3[1]) * 30 : null;
            return {
              appointment_id: appointment.id,
              doctor_id: appointment.doctor_id,
              patient_id: appointment.patient_id,
              medicine_name: m.medicine_name.trim(),
              brand: m.brand || null,
              dosage: m.dosage || null,
              frequency: m.frequency || null,
              timing: m.timing || [],
              duration: m.duration || null,
              duration_days: days,
              meal: m.meal || null,
              instructions: m.instructions || null,
            };
          });
        if (rows.length > 0) {
          await supabase.from("appointment_prescribed_medicines").insert(rows as any);
        }
      }


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
        completed_at: new Date().toISOString(),
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

      // Confidential notes now live on the patient profile (shared across all appointments)
      const { error: noteError } = await supabase
        .from("patients")
        .update({ confidential_notes: formData.confidential_notes || null })
        .eq("id", appointment.patient_id);
      if (noteError) throw noteError;

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
      <div className="space-y-6 relative cursor-progress">
        {/* Top indeterminate progress bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary/10 z-50 overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
        <style>{`@keyframes progress {0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading appointment details…</span>
        </div>
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 animate-pulse" />
            <Skeleton className="h-64 animate-pulse" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 animate-pulse" />
            <Skeleton className="h-32 animate-pulse" />
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <BreadcrumbPage>#{appointmentNumber}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">#{appointmentNumber}</h1>
            <Badge variant="outline" className={cn("capitalize", getStatusColor(appointment.status))}>
              {appointment.status.replace("_", " ")}
            </Badge>
            <span className="text-muted-foreground">
              {format(new Date(appointment.appointment_date), "MMMM d, yyyy")} at {appointment.appointment_time}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AIVisitSummary
            patientName={appointment.patients.full_name}
            patientAge={differenceInYears(new Date(), new Date(appointment.patients.date_of_birth))}
            patientGender={appointment.patients.gender}
            bloodGroup={appointment.patients.blood_group}
            allergies={appointment.patients.allergies}
            diseases={appointment.patients.major_diseases}
            chiefComplaint={formData.chief_complaint}
            diagnosis={icdCodes.find(c => c.id === selectedICDCode)?.description}
            prescription={formData.current_prescription}
            vitalSigns={[
              formData.blood_pressure && `BP: ${formData.blood_pressure}`,
              formData.temperature && `Temp: ${formData.temperature}°F`,
              formData.pulse && `Pulse: ${formData.pulse}`,
              formData.weight && `Weight: ${formData.weight}kg`,
              formData.height && `Height: ${formData.height}cm`,
            ].filter(Boolean).join(", ") || undefined}
            testReports={formData.test_reports}
            nextVisitNotes={formData.next_visit_notes}
            nextVisitDate={nextVisitDate ? format(nextVisitDate, "PPP") : undefined}
          />
          {appointment.appointment_type === "video_consultation" && (
            <StartVideoConsultation
              appointmentId={appointment.id}
              doctorId={appointment.doctor_id}
              patientId={appointment.patient_id}
              patientName={appointment.patients.full_name}
              patientPhone={appointment.patients.phone}
            />
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Prescription
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowReportDialog(true)} className="border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white">
            <FileBarChart className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          {appointment.status === "completed" && (
            <Button size="sm" onClick={handlePrintInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Receipt className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More actions
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {appointment.status === "scheduled" && (
                <DropdownMenuItem onClick={() => handleStatusChange("start")}>
                  <Play className="h-4 w-4 mr-2" /> Start
                </DropdownMenuItem>
              )}
              {(appointment.status === "scheduled" || appointment.status === "start") && (
                <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                </DropdownMenuItem>
              )}
              {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" /> Cancel Appointment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex">
            <Button
              variant="outline"
              size="icon"
              className="rounded-r-none border-r-0"
              disabled={!prevId}
              onClick={() => prevId && navigate(`/doctor/appointments/${prevId}`)}
              title="Previous appointment"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-none"
              disabled={!nextId}
              onClick={() => nextId && navigate(`/doctor/appointments/${nextId}`)}
              title="Next appointment"
            >
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

                {/* Ophthalmology Examination - eye specialists only */}
                {isOphthalmologist && (
                  <OphthalmologyExamination value={ophthalmologyData} onChange={setOphthalmologyData} />
                )}

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
                        <SelectValue placeholder="Append a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Append Template (pick multiple) --</SelectItem>
                        {diseaseTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.disease_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <AIPrescriptionAssistant
                    chiefComplaint={formData.chief_complaint}
                    diagnosis={icdCodes.find(c => c.id === selectedICDCode)?.description}
                    patientAge={appointment?.patients ? differenceInYears(new Date(), new Date(appointment.patients.date_of_birth)) : 0}
                    patientGender={appointment?.patients?.gender || "unknown"}
                    allergies={appointment?.patients?.allergies}
                    diseases={appointment?.patients?.major_diseases}
                    vitalSigns={[
                      formData.blood_pressure && `BP: ${formData.blood_pressure}`,
                      formData.temperature && `Temp: ${formData.temperature}°F`,
                      formData.pulse && `Pulse: ${formData.pulse}`,
                      formData.weight && `Weight: ${formData.weight}kg`,
                    ].filter(Boolean).join(", ") || undefined}
                    onApplySuggestion={(text) => setFormData(prev => ({ ...prev, current_prescription: text }))}
                  />
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

            {/* Confidential Notes Card — stored on the patient profile */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Confidential Notes (Patient)</CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Shared across all visits for this patient. Visible to doctors and clinic staff only.
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Private notes about this patient..."
                  value={formData.confidential_notes}
                  onChange={(e) => setFormData({...formData, confidential_notes: e.target.value})}
                  rows={4}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  {appointment.patients.date_of_birth && (
                    <p><span className="text-muted-foreground">Age:</span> {calculateAge(appointment.patients.date_of_birth)} years</p>
                  )}
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {appointment.patients.phone && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${appointment.patients.phone}`} className="text-primary hover:underline">
                      {appointment.patients.phone}
                    </a>
                  </div>
                )}
                {appointment.patients.email && (
                  <div className="flex items-center gap-2 flex-wrap">
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

            {/* Visit History - Moved below Contact Information */}
            <VisitHistory patientId={appointment.patient_id} />

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
          </div>
        </div>
      </form>
      <PrintReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        appointment={appointment ? {
          id: appointment.id,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          doctor_id: appointment.doctor_id,
          patients: {
            full_name: appointment.patients.full_name,
            patient_id: appointment.patients.patient_id,
            phone: appointment.patients.phone,
            date_of_birth: appointment.patients.date_of_birth,
            gender: appointment.patients.gender,
          },
        } : null}
      />
    </div>
  );
};

export default DoctorAppointmentDetail;
