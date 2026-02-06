import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Eye, ArrowLeft, Plus, Calendar as CalendarIcon, Search, Edit, Trash2, X, Upload, FileSpreadsheet } from "lucide-react";
import PatientImportExport from "@/components/PatientImportExport";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subMonths, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { getTrimester } from "@/lib/pregnancyUtils";
import { CitySelect } from "@/components/CitySelect";
import { 
  validateName, 
  validatePhone, 
  validateEmail, 
  validateCNIC,
  handleNameInput,
  handlePhoneInput,
  handleCNICInput
} from "@/lib/validations";
import { useClinicId } from "@/hooks/useClinicId";
import { MultiSelectSearchable } from "@/components/MultiSelectSearchable";
import { VisitHistory } from "@/components/VisitHistory";
import { TablePagination } from "@/components/TablePagination";
import DeletingOverlay from "@/components/DeletingOverlay";
import { logActivity } from "@/lib/activityLogger";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  father_name: string | null;
  email: string | null;
  phone: string;
  cnic: string | null;
  gender: string;
  date_of_birth: string;
  blood_group: string | null;
  city: string | null;
  address: string | null;
  allergies: string | null;
  marital_status: string | null;
  major_diseases: string | null;
  medical_history: string | null;
  created_by: string | null;
  created_at: string;
  pregnancy_start_date: string | null;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  };
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  created_at: string;
}

interface MedicalHistoryEntry {
  id: string;
  title: string;
  description: string;
  date: string;
}

const ClinicPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdFromParams = searchParams.get("doctorId");
  const { clinicId, isReceptionist, loading: clinicLoading } = useClinicId();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctorIdFromParams || "all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [trimesterFilter, setTrimesterFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAddedDateFrom, setFilterAddedDateFrom] = useState<Date>();
  const [filterAddedDateTo, setFilterAddedDateTo] = useState<Date>();
  const [addedDateFromPopoverOpen, setAddedDateFromPopoverOpen] = useState(false);
  const [addedDateToPopoverOpen, setAddedDateToPopoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Selected patient state for expandable row
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);

  // Add Patient Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dobDate, setDobDate] = useState<Date>();
  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    doctor_id: "",
    full_name: "",
    father_name: "",
    email: "",
    phone: "",
    cnic: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
    blood_group: "",
    address: "",
    allergies: "",
    marital_status: "",
    city: "",
    major_diseases: "",
    added_date: "",
  });
  const [addedDate, setAddedDate] = useState<Date>();
  const [addedDatePopoverOpen, setAddedDatePopoverOpen] = useState(false);

  // Edit Patient Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDobDate, setEditDobDate] = useState<Date>();
  const [editDobPopoverOpen, setEditDobPopoverOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    father_name: "",
    email: "",
    phone: "",
    cnic: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
    blood_group: "",
    address: "",
    allergies: "",
    marital_status: "",
    city: "",
    major_diseases: "",
  });

  // Delete Patient Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Medical History Dialog States
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditHistoryDialogOpen, setIsEditHistoryDialogOpen] = useState(false);
  const [newHistoryTitle, setNewHistoryTitle] = useState("");
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [newHistoryDate, setNewHistoryDate] = useState("");
  const [newHistoryDateObj, setNewHistoryDateObj] = useState<Date>();
  const [newHistoryDatePopoverOpen, setNewHistoryDatePopoverOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistoryEntry | null>(null);

  // Document Upload State
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [documentDatePopoverOpen, setDocumentDatePopoverOpen] = useState(false);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [allergyOptions, setAllergyOptions] = useState<{ value: string; label: string }[]>([]);
  const [diseaseOptions, setDiseaseOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [editSelectedAllergies, setEditSelectedAllergies] = useState<string[]>([]);
  const [editSelectedDiseases, setEditSelectedDiseases] = useState<string[]>([]);

  // Sync dobDate with addForm.date_of_birth
  useEffect(() => {
    if (dobDate) {
      setAddForm(prev => ({ ...prev, date_of_birth: format(dobDate, 'yyyy-MM-dd') }));
    }
  }, [dobDate]);

  // Sync editDobDate with editForm.date_of_birth
  useEffect(() => {
    if (editDobDate) {
      setEditForm(prev => ({ ...prev, date_of_birth: format(editDobDate, 'yyyy-MM-dd') }));
    }
  }, [editDobDate]);

  // Sync addedDate with addForm.added_date
  useEffect(() => {
    if (addedDate) {
      setAddForm(prev => ({ ...prev, added_date: format(addedDate, 'yyyy-MM-dd\'T\'HH:mm:ss') }));
    }
  }, [addedDate]);

  const cities = [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Hyderabad",
    "Gujranwala", "Peshawar", "Quetta", "Islamabad", "Sialkot", "Bahawalpur",
  ];

  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
      fetchAllergyAndDiseaseOptions();
    }
  }, [clinicId]);

  // Fetch patients when filters or pagination changes
  useEffect(() => {
    if (doctorIds.length > 0) {
      fetchPatients();
    }
  }, [doctorIds, currentPage, pageSize, searchTerm, selectedDoctor, selectedGender, selectedCity, ageFilter, trimesterFilter, filterAddedDateFrom, filterAddedDateTo]);

  const fetchAllergyAndDiseaseOptions = async () => {
    if (!clinicId) return;

    // Fetch allergies
    const { data: allergies } = await supabase
      .from("clinic_allergies")
      .select("name")
      .eq("clinic_id", clinicId)
      .order("name");

    if (allergies) {
      setAllergyOptions(allergies.map(a => ({ value: a.name, label: a.name })));
    }

    // Fetch diseases
    const { data: diseases } = await supabase
      .from("clinic_diseases")
      .select("name")
      .eq("clinic_id", clinicId)
      .order("name");

    if (diseases) {
      setDiseaseOptions(diseases.map(d => ({ value: d.name, label: d.name })));
    }
  };

  useEffect(() => {
    if (doctorIdFromParams) {
      setSelectedDoctor(doctorIdFromParams);
    }
  }, [doctorIdFromParams]);

  const fetchDoctors = async () => {
    if (!clinicId) return;
    try {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("clinic_id", clinicId);

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);
      setDoctorIds(doctorsData?.map(d => d.id) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPatients = async () => {
    if (doctorIds.length === 0) return;
    setLoading(true);
    try {
      // Build query with server-side filters
      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .in("created_by", selectedDoctor !== "all" ? [selectedDoctor] : doctorIds)
        .order("created_at", { ascending: false });

      // Server-side search
      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm.trim()}%,patient_id.ilike.%${searchTerm.trim()}%,phone.ilike.%${searchTerm.trim()}%`);
      }

      // Server-side gender filter
      if (selectedGender !== "all") {
        query = query.eq("gender", selectedGender as any);
      }

      // Server-side city filter
      if (selectedCity !== "all") {
        query = query.eq("city", selectedCity);
      }

      // Server-side date filters
      if (filterAddedDateFrom) {
        query = query.gte("created_at", format(startOfDay(filterAddedDateFrom), "yyyy-MM-dd'T'HH:mm:ss"));
      }
      if (filterAddedDateTo) {
        query = query.lte("created_at", format(endOfDay(filterAddedDateTo), "yyyy-MM-dd'T'HH:mm:ss"));
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: patientsData, error: patientsError, count } = await query;

      if (patientsError) throw patientsError;
      
      // Client-side age filter (can't easily do date calculations in Postgres)
      let filteredData = patientsData || [];
      if (ageFilter !== "all") {
        filteredData = filteredData.filter(p => {
          const age = calculateAge(p.date_of_birth);
          switch (ageFilter) {
            case "0-18": return age >= 0 && age <= 18;
            case "19-35": return age >= 19 && age <= 35;
            case "36-50": return age >= 36 && age <= 50;
            case "51+": return age >= 51;
            default: return true;
          }
        });
      }

      // Client-side trimester filter
      if (trimesterFilter !== "all") {
        filteredData = filteredData.filter(p => {
          if (!p.pregnancy_start_date) return false;
          const trimester = getTrimester(p.pregnancy_start_date);
          return trimester === parseInt(trimesterFilter);
        });
      }

      setPatients(filteredData);
      setTotalCount(count || 0);
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

  const fetchMedicalHistory = (patient: Patient) => {
    try {
      const history = patient.medical_history 
        ? JSON.parse(patient.medical_history) 
        : [];
      setMedicalHistory(Array.isArray(history) ? history : []);
    } catch {
      setMedicalHistory([]);
    }
  };

  const fetchDocuments = async (patientId: string) => {
    const { data, error } = await supabase
      .from("medical_documents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
      return;
    }

    setDocuments(data || []);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // With server-side pagination, patients are already filtered and paginated
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDoctor, selectedGender, selectedCity, ageFilter, trimesterFilter, pageSize, filterAddedDateFrom, filterAddedDateTo]);

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Unknown";
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.profiles?.full_name || "Unknown";
  };

  const handleRowClick = (patient: Patient) => {
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patient);
      fetchMedicalHistory(patient);
      fetchDocuments(patient.id);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditForm({
      full_name: patient.full_name,
      father_name: patient.father_name || "",
      email: patient.email || "",
      phone: patient.phone,
      cnic: patient.cnic || "",
      date_of_birth: patient.date_of_birth,
      gender: patient.gender as "male" | "female" | "other",
      blood_group: patient.blood_group || "",
      address: patient.address || "",
      allergies: patient.allergies || "",
      marital_status: patient.marital_status || "",
      city: patient.city || "",
      major_diseases: patient.major_diseases || "",
    });
    setEditDobDate(patient.date_of_birth ? new Date(patient.date_of_birth) : undefined);
    setEditSelectedAllergies(patient.allergies ? patient.allergies.split(", ") : []);
    setEditSelectedDiseases(patient.major_diseases ? patient.major_diseases.split(", ") : []);
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;

    setEditFormErrors({});
    const errors: Record<string, string> = {};
    
    const nameValidation = validateName(editForm.full_name);
    if (!nameValidation.isValid) errors.full_name = nameValidation.message;
    
    const phoneValidation = validatePhone(editForm.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    
    if (editForm.email) {
      const emailValidation = validateEmail(editForm.email, false);
      if (!emailValidation.isValid) errors.email = emailValidation.message;
    }
    
    if (editForm.cnic) {
      const cnicValidation = validateCNIC(editForm.cnic);
      if (!cnicValidation.isValid) errors.cnic = cnicValidation.message;
    }
    
    if (!editForm.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      const missingFields = Object.values(errors).join(", ");
      toast({ 
        title: "Missing Required Fields", 
        description: missingFields,
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase
      .from("patients")
      .update({
        full_name: editForm.full_name,
        father_name: editForm.father_name || null,
        email: editForm.email || null,
        phone: editForm.phone,
        cnic: editForm.cnic || null,
        date_of_birth: editForm.date_of_birth,
        gender: editForm.gender,
        blood_group: editForm.blood_group || null,
        address: editForm.address || null,
        allergies: editSelectedAllergies.length > 0 ? editSelectedAllergies.join(", ") : null,
        marital_status: editForm.marital_status || null,
        city: editForm.city || null,
        major_diseases: editSelectedDiseases.length > 0 ? editSelectedDiseases.join(", ") : null,
      })
      .eq("id", selectedPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update patient: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Patient updated successfully",
    });

    setIsEditDialogOpen(false);
    setSelectedPatient(null);
    fetchPatients();
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    setIsDeleteDialogOpen(false);
    setIsDeleting(true);

    try {
      // Delete related medical documents first
      await supabase.from("medical_documents").delete().eq("patient_id", patientToDelete.id);
      
      // Delete related prescriptions
      await supabase.from("prescriptions").delete().eq("patient_id", patientToDelete.id);
      
      // Delete related medical records
      await supabase.from("medical_records").delete().eq("patient_id", patientToDelete.id);
      
      // Delete related visit records
      await supabase.from("visit_records").delete().eq("patient_id", patientToDelete.id);
      
      // Delete related appointments
      await supabase.from("appointments").delete().eq("patient_id", patientToDelete.id);
      
      // Delete related wait list entries
      await supabase.from("wait_list").delete().eq("patient_id", patientToDelete.id);

      // Finally delete the patient
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient and all related data deleted successfully",
      });

      setPatientToDelete(null);
      if (selectedPatient?.id === patientToDelete.id) {
        setSelectedPatient(null);
      }
      fetchPatients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddHistory = async () => {
    if (!selectedPatient || !newHistoryTitle.trim() || !newHistoryDate) {
      toast({
        title: "Error",
        description: "Please enter title and date for the medical history",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MedicalHistoryEntry = {
      id: Date.now().toString(),
      title: newHistoryTitle,
      description: newHistoryDescription,
      date: newHistoryDate,
    };

    const updatedHistory = [...medicalHistory, newEntry];

    const { error } = await supabase
      .from("patients")
      .update({ medical_history: JSON.stringify(updatedHistory) })
      .eq("id", selectedPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add medical history",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Medical history added successfully",
    });

    setMedicalHistory(updatedHistory);
    setNewHistoryTitle("");
    setNewHistoryDescription("");
    setNewHistoryDate("");
    setNewHistoryDateObj(undefined);
    setIsHistoryDialogOpen(false);
    fetchPatients();
  };

  const handleUpdateHistory = async () => {
    if (!selectedPatient || !editingHistory || !newHistoryTitle.trim() || !newHistoryDate) {
      toast({
        title: "Error",
        description: "Please enter title and date for the medical history",
        variant: "destructive",
      });
      return;
    }

    const updatedHistory = medicalHistory.map(entry =>
      entry.id === editingHistory.id
        ? { ...entry, title: newHistoryTitle, description: newHistoryDescription, date: newHistoryDate }
        : entry
    );

    const { error } = await supabase
      .from("patients")
      .update({ medical_history: JSON.stringify(updatedHistory) })
      .eq("id", selectedPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update medical history",
        variant: "destructive",
      });
      return;
    }

    setMedicalHistory(updatedHistory);
    toast({
      title: "Success",
      description: "Medical history updated successfully",
    });

    setNewHistoryTitle("");
    setNewHistoryDescription("");
    setNewHistoryDate("");
    setNewHistoryDateObj(undefined);
    setEditingHistory(null);
    setIsEditHistoryDialogOpen(false);
    fetchPatients();
  };

  const handleDeleteHistory = async (id: string) => {
    if (!selectedPatient) return;

    const updatedHistory = medicalHistory.filter(entry => entry.id !== id);

    const { error } = await supabase
      .from("patients")
      .update({ medical_history: JSON.stringify(updatedHistory) })
      .eq("id", selectedPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete medical history",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Medical history deleted successfully",
    });

    setMedicalHistory(updatedHistory);
    fetchPatients();
  };

  const handleViewDocument = async (documentUrl: string) => {
    const { data, error } = await supabase.storage
      .from("medical-documents")
      .createSignedUrl(documentUrl, 60);

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleDeleteDocument = async (docId: string, documentUrl: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("medical-documents")
        .remove([documentUrl]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("medical_documents")
        .delete()
        .eq("id", docId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      if (selectedPatient) {
        fetchDocuments(selectedPatient.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentTitle.trim() || !documentDate || !selectedPatient) {
      toast({ title: "Please provide title, date and file", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileExt = documentFile.name.split(".").pop();
      const fileName = `${selectedPatient.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(fileName, documentFile);

      if (uploadError) throw uploadError;

      const filePath = fileName;

      const { error: dbError } = await supabase
        .from("medical_documents")
        .insert({
          patient_id: selectedPatient.id,
          document_name: documentTitle,
          document_type: documentFile.type,
          document_url: filePath,
          uploaded_by: user.id,
          created_at: documentDate,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      setDocumentFile(null);
      setDocumentTitle("");
      setDocumentDate("");
      await fetchDocuments(selectedPatient.id);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleAddPatient = async () => {
    setFormErrors({});
    const errors: Record<string, string> = {};

    if (!addForm.doctor_id) {
      errors.doctor_id = "Please select a doctor";
    }
    
    const nameValidation = validateName(addForm.full_name);
    if (!nameValidation.isValid) errors.full_name = nameValidation.message;
    
    const phoneValidation = validatePhone(addForm.phone);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
    
    if (addForm.email) {
      const emailValidation = validateEmail(addForm.email, false);
      if (!emailValidation.isValid) errors.email = emailValidation.message;
    }
    
    if (addForm.cnic) {
      const cnicValidation = validateCNIC(addForm.cnic);
      if (!cnicValidation.isValid) errors.cnic = cnicValidation.message;
    }
    
    if (addForm.father_name) {
      const fatherNameValidation = validateName(addForm.father_name);
      if (!fatherNameValidation.isValid) errors.father_name = fatherNameValidation.message;
    }
    
    if (!addForm.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const missingFields = Object.values(errors).join(", ");
      toast({ 
        title: "Missing Required Fields", 
        description: missingFields,
        variant: "destructive" 
      });
      return;
    }

    // Generate patient ID
    const patientId = `PAT${Date.now().toString().slice(-8)}`;

    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          full_name: addForm.full_name,
          father_name: addForm.father_name || null,
          email: addForm.email || null,
          phone: addForm.phone,
          cnic: addForm.cnic || null,
          date_of_birth: addForm.date_of_birth,
          gender: addForm.gender,
          blood_group: addForm.blood_group || null,
          address: addForm.address || null,
          allergies: selectedAllergies.length > 0 ? selectedAllergies.join(", ") : null,
          marital_status: addForm.marital_status || null,
          city: addForm.city || null,
          major_diseases: selectedDiseases.length > 0 ? selectedDiseases.join(", ") : null,
          patient_id: patientId,
          created_by: addForm.doctor_id,
          created_at: addForm.added_date || new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Error",
        description: `Failed to add patient: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    // Log activity
    if (data && data[0]) {
      await logActivity({
        action: "patient_created",
        entityType: "patient",
        entityId: data[0].id,
        details: {
          doctorId: addForm.doctor_id,
          patient_name: addForm.full_name,
          patient_id: patientId,
        },
      });
    }

    toast({
      title: "Success",
      description: "Patient added successfully",
    });

    setAddForm({
      doctor_id: "",
      full_name: "",
      father_name: "",
      email: "",
      phone: "",
      cnic: "",
      date_of_birth: "",
      gender: "male",
      blood_group: "",
      address: "",
      allergies: "",
      marital_status: "",
      city: "",
      major_diseases: "",
      added_date: "",
    });
    setAddedDate(undefined);
    setDobDate(undefined);
    setSelectedAllergies([]);
    setSelectedDiseases([]);
    setIsAddDialogOpen(false);
    fetchPatients();
  };

  return (
    <>
      <DeletingOverlay isVisible={isDeleting} message="Deleting Patient..." />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex gap-2">
          {selectedDoctor !== "all" && (
            <PatientImportExport 
              createdBy={selectedDoctor} 
              onImportComplete={fetchPatients} 
            />
          )}
          {selectedDoctor === "all" && doctors.length > 0 && (
            <PatientImportExport 
              createdBy={doctors[0].id} 
              onImportComplete={fetchPatients} 
            />
          )}
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Patients</CardTitle>
          <CardDescription>
            View and manage all patients from your clinic doctors ({totalCount} patients)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, patient ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Filter by Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.profiles?.full_name || "Unknown Doctor"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Age</Label>
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-18">0-18 years</SelectItem>
                  <SelectItem value="19-35">19-35 years</SelectItem>
                  <SelectItem value="36-50">36-50 years</SelectItem>
                  <SelectItem value="51+">51+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by City</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Added Date Range</Label>
              <div className="flex gap-2 items-center">
                <Popover open={addedDateFromPopoverOpen} onOpenChange={setAddedDateFromPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal", !filterAddedDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterAddedDateFrom ? format(filterAddedDateFrom, "PP") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filterAddedDateFrom}
                      onSelect={(date) => { setFilterAddedDateFrom(date); setAddedDateFromPopoverOpen(false); }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      fromDate={subMonths(new Date(), 12)}
                      toDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Popover open={addedDateToPopoverOpen} onOpenChange={setAddedDateToPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal", !filterAddedDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterAddedDateTo ? format(filterAddedDateTo, "PP") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filterAddedDateTo}
                      onSelect={(date) => { setFilterAddedDateTo(date); setAddedDateToPopoverOpen(false); }}
                      disabled={(date) => date > new Date() || (filterAddedDateFrom && date < filterAddedDateFrom)}
                      initialFocus
                      fromDate={subMonths(new Date(), 12)}
                      toDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {(filterAddedDateFrom || filterAddedDateTo) && (
                  <Button variant="ghost" size="icon" onClick={() => { setFilterAddedDateFrom(undefined); setFilterAddedDateTo(undefined); }}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading patients...</p>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-6">
                {patients.length === 0 
                  ? "Your doctors haven't added any patients yet" 
                  : "No patients match the selected filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Added Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <>
                        <TableRow
                          key={patient.id}
                          className={`cursor-pointer transition-colors ${
                            selectedPatient?.id === patient.id
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleRowClick(patient)}
                        >
                          <TableCell className="font-mono text-sm">{patient.patient_id}</TableCell>
                          <TableCell className="font-semibold">{patient.full_name}</TableCell>
                          <TableCell>{patient.email || "-"}</TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell className="capitalize">{patient.gender}</TableCell>
                          <TableCell>{calculateAge(patient.date_of_birth)} years</TableCell>
                          <TableCell>{patient.blood_group || "-"}</TableCell>
                          <TableCell>{format(new Date(patient.created_at), "PP")}</TableCell>
                        </TableRow>
                        {selectedPatient?.id === patient.id && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <div className="border-t bg-muted/30 p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-lg font-semibold">Patient Details</h3>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPatient(selectedPatient);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPatientToDelete(selectedPatient);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPatient(null);
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <Tabs defaultValue="info" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="info">Information</TabsTrigger>
                                    <TabsTrigger value="history">Medical History</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                    <TabsTrigger value="visits">Visit History</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="info" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Patient ID</p>
                                        <p className="font-medium">{selectedPatient.patient_id}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{selectedPatient.full_name}</p>
                                      </div>
                                      {selectedPatient.father_name && (
                                        <div>
                                          <p className="text-sm text-muted-foreground">Father Name</p>
                                          <p className="font-medium">{selectedPatient.father_name}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedPatient.email || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{selectedPatient.phone}</p>
                                      </div>
                                      {selectedPatient.cnic && (
                                        <div>
                                          <p className="text-sm text-muted-foreground">CNIC</p>
                                          <p className="font-medium">{selectedPatient.cnic}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{format(new Date(selectedPatient.date_of_birth), "PPP")}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Age</p>
                                        <p className="font-medium">{calculateAge(selectedPatient.date_of_birth)} years</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Gender</p>
                                        <p className="font-medium capitalize">{selectedPatient.gender}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Blood Group</p>
                                        <p className="font-medium">{selectedPatient.blood_group || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Marital Status</p>
                                        <p className="font-medium capitalize">{selectedPatient.marital_status || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">City</p>
                                        <p className="font-medium">{selectedPatient.city || "N/A"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Address</p>
                                        <p className="font-medium">{selectedPatient.address || "N/A"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Allergies</p>
                                        <p className="font-medium">{selectedPatient.allergies || "N/A"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Major Diseases</p>
                                        <p className="font-medium">{selectedPatient.major_diseases || "N/A"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Assigned Doctor</p>
                                        <p className="font-medium">{getDoctorName(selectedPatient.created_by)}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="history" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold">Medical History</h4>
                                      <Button size="sm" onClick={() => setIsHistoryDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Entry
                                      </Button>
                                    </div>
                                    <div className="space-y-3">
                                      {medicalHistory.map((entry) => (
                                        <Card key={entry.id}>
                                          <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <h5 className="font-semibold">{entry.title}</h5>
                                                <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                  {format(new Date(entry.date), "PPP")}
                                                </p>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => {
                                                    setEditingHistory(entry);
                                                    setNewHistoryTitle(entry.title);
                                                    setNewHistoryDescription(entry.description);
                                                    setNewHistoryDate(entry.date);
                                                    setNewHistoryDateObj(new Date(entry.date));
                                                    setIsEditHistoryDialogOpen(true);
                                                  }}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleDeleteHistory(entry.id)}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                      {medicalHistory.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                          No medical history recorded
                                        </p>
                                      )}
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="documents" className="space-y-4">
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Document Title</Label>
                                        <Input
                                          value={documentTitle}
                                          onChange={(e) => setDocumentTitle(e.target.value)}
                                          placeholder="Enter document title"
                                        />
                                      </div>
                                      <div>
                                        <Label>Document Date</Label>
                                        <Popover open={documentDatePopoverOpen} onOpenChange={setDocumentDatePopoverOpen}>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !documentDate && "text-muted-foreground"
                                              )}
                                            >
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {documentDate ? format(new Date(documentDate), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                              mode="single"
                                              selected={documentDate ? new Date(documentDate) : undefined}
                                              onSelect={(date) => {
                                                if (date) {
                                                  setDocumentDate(format(date, "yyyy-MM-dd"));
                                                  setDocumentDatePopoverOpen(false);
                                                }
                                              }}
                                              initialFocus
                                              className="pointer-events-auto"
                                              captionLayout="dropdown-buttons"
                                              fromYear={1900}
                                              toYear={new Date().getFullYear()}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                      <div>
                                        <Label>Upload Document</Label>
                                        <Input
                                          type="file"
                                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                                        />
                                      </div>
                                      <Button onClick={handleUploadDocument} className="w-full">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Document
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {documents.map((doc) => (
                                        <Card key={doc.id}>
                                          <CardContent className="p-4 flex justify-between items-center">
                                            <div className="flex-1">
                                              <p className="font-medium">{doc.document_name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {format(new Date(doc.created_at), "PPP")}
                                              </p>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleViewDocument(doc.document_url)}
                                              >
                                                <Eye className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteDocument(doc.id, doc.document_url)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                      {documents.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                          No documents uploaded
                                        </p>
                                      )}
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="visits" className="space-y-4">
                                    <VisitHistory patientId={selectedPatient.id} />
                                  </TabsContent>
                                </Tabs>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Doctor Selection */}
              <div className="col-span-2">
                <Label>Select Doctor *</Label>
                <Select
                  value={addForm.doctor_id}
                  onValueChange={(value) => setAddForm({ ...addForm, doctor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor for this patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.profiles?.full_name || "Unknown Doctor"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: handleNameInput(e) })}
                  placeholder="Enter full name"
                  className={formErrors.full_name ? "border-destructive" : ""}
                />
                {formErrors.full_name && <p className="text-sm text-destructive">{formErrors.full_name}</p>}
              </div>
              <div>
                <Label>Father Name</Label>
                <Input
                  value={addForm.father_name}
                  onChange={(e) => setAddForm({ ...addForm, father_name: handleNameInput(e) })}
                  placeholder="Enter father name"
                  className={formErrors.father_name ? "border-destructive" : ""}
                />
                {formErrors.father_name && <p className="text-sm text-destructive">{formErrors.father_name}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Enter email"
                  className={formErrors.email ? "border-destructive" : ""}
                />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: handlePhoneInput(e) })}
                  placeholder="Enter phone number"
                  className={formErrors.phone ? "border-destructive" : ""}
                />
                {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
              </div>
              <div>
                <Label>CNIC</Label>
                <Input
                  value={addForm.cnic}
                  onChange={(e) => setAddForm({ ...addForm, cnic: handleCNICInput(e) })}
                  placeholder="Enter CNIC (13 digits)"
                  maxLength={15}
                  className={formErrors.cnic ? "border-destructive" : ""}
                />
                {formErrors.cnic && <p className="text-sm text-destructive">{formErrors.cnic}</p>}
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Popover open={dobPopoverOpen} onOpenChange={setDobPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !addForm.date_of_birth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {addForm.date_of_birth ? format(new Date(addForm.date_of_birth), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={(date) => {
                        if (date) {
                          setDobDate(date);
                          setDobPopoverOpen(false);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Added Date</Label>
                <Popover open={addedDatePopoverOpen} onOpenChange={setAddedDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !addedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {addedDate ? format(addedDate, "PPP") : <span>Today (default)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={addedDate}
                      onSelect={(date) => {
                        setAddedDate(date);
                        setAddedDatePopoverOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                      fromDate={subMonths(new Date(), 12)}
                      toDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(value: "male" | "female" | "other") => setAddForm({ ...addForm, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select
                  value={addForm.blood_group}
                  onValueChange={(value) => setAddForm({ ...addForm, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select
                  value={addForm.marital_status}
                  onValueChange={(value) => setAddForm({ ...addForm, marital_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <CitySelect 
                  value={addForm.city} 
                  onValueChange={(value) => setAddForm({ ...addForm, city: value })}
                  label="City"
                />
              </div>
              <div className="col-span-2">
                <Label>Allergies</Label>
                <MultiSelectSearchable
                  options={allergyOptions}
                  values={selectedAllergies}
                  onValuesChange={setSelectedAllergies}
                  placeholder="Select allergies..."
                />
              </div>
              <div className="col-span-2">
                <Label>Major Diseases</Label>
                <MultiSelectSearchable
                  options={diseaseOptions}
                  values={selectedDiseases}
                  onValuesChange={setSelectedDiseases}
                  placeholder="Select diseases..."
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>Add Patient</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: handleNameInput(e) })}
                  placeholder="Enter full name"
                  className={editFormErrors.full_name ? "border-destructive" : ""}
                />
                {editFormErrors.full_name && <p className="text-sm text-destructive">{editFormErrors.full_name}</p>}
              </div>
              <div>
                <Label>Father Name</Label>
                <Input
                  value={editForm.father_name}
                  onChange={(e) => setEditForm({ ...editForm, father_name: handleNameInput(e) })}
                  placeholder="Enter father name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email"
                  className={editFormErrors.email ? "border-destructive" : ""}
                />
                {editFormErrors.email && <p className="text-sm text-destructive">{editFormErrors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: handlePhoneInput(e) })}
                  placeholder="Enter phone number"
                  className={editFormErrors.phone ? "border-destructive" : ""}
                />
                {editFormErrors.phone && <p className="text-sm text-destructive">{editFormErrors.phone}</p>}
              </div>
              <div>
                <Label>CNIC</Label>
                <Input
                  value={editForm.cnic}
                  onChange={(e) => setEditForm({ ...editForm, cnic: handleCNICInput(e) })}
                  placeholder="Enter CNIC (13 digits)"
                  maxLength={15}
                  className={editFormErrors.cnic ? "border-destructive" : ""}
                />
                {editFormErrors.cnic && <p className="text-sm text-destructive">{editFormErrors.cnic}</p>}
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Popover open={editDobPopoverOpen} onOpenChange={setEditDobPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editForm.date_of_birth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.date_of_birth ? format(new Date(editForm.date_of_birth), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDobDate}
                      onSelect={(date) => {
                        if (date) {
                          setEditDobDate(date);
                          setEditDobPopoverOpen(false);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={editForm.gender}
                  onValueChange={(value: "male" | "female" | "other") => setEditForm({ ...editForm, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select
                  value={editForm.blood_group}
                  onValueChange={(value) => setEditForm({ ...editForm, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select
                  value={editForm.marital_status}
                  onValueChange={(value) => setEditForm({ ...editForm, marital_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <CitySelect 
                  value={editForm.city} 
                  onValueChange={(value) => setEditForm({ ...editForm, city: value })}
                  label="City"
                />
              </div>
              <div className="col-span-2">
                <Label>Allergies</Label>
                <MultiSelectSearchable
                  options={allergyOptions}
                  values={editSelectedAllergies}
                  onValuesChange={setEditSelectedAllergies}
                  placeholder="Select allergies..."
                />
              </div>
              <div className="col-span-2">
                <Label>Major Diseases</Label>
                <MultiSelectSearchable
                  options={diseaseOptions}
                  values={editSelectedDiseases}
                  onValuesChange={setEditSelectedDiseases}
                  placeholder="Select diseases..."
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePatient}>Update Patient</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record
              for {patientToDelete?.full_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Medical History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medical History Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newHistoryTitle}
                onChange={(e) => setNewHistoryTitle(e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newHistoryDescription}
                onChange={(e) => setNewHistoryDescription(e.target.value)}
                placeholder="Detailed description..."
                rows={4}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Popover open={newHistoryDatePopoverOpen} onOpenChange={setNewHistoryDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newHistoryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newHistoryDate ? format(new Date(newHistoryDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newHistoryDateObj}
                    onSelect={(date) => {
                      if (date) {
                        setNewHistoryDateObj(date);
                        setNewHistoryDate(format(date, "yyyy-MM-dd"));
                        setNewHistoryDatePopoverOpen(false);
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddHistory}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Medical History Dialog */}
      <Dialog open={isEditHistoryDialogOpen} onOpenChange={setIsEditHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medical History Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newHistoryTitle}
                onChange={(e) => setNewHistoryTitle(e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newHistoryDescription}
                onChange={(e) => setNewHistoryDescription(e.target.value)}
                placeholder="Detailed description..."
                rows={4}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Popover open={newHistoryDatePopoverOpen} onOpenChange={setNewHistoryDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newHistoryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newHistoryDate ? format(new Date(newHistoryDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newHistoryDateObj}
                    onSelect={(date) => {
                      if (date) {
                        setNewHistoryDateObj(date);
                        setNewHistoryDate(format(date, "yyyy-MM-dd"));
                        setNewHistoryDatePopoverOpen(false);
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateHistory}>Update Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default ClinicPatients;
