import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Search, Upload, Eye, Trash2, Edit, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { VisitHistory } from "@/components/VisitHistory";
import { format, differenceInYears, subMonths, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/CitySelect";
import { Badge } from "@/components/ui/badge";
import { calculatePregnancyDuration, calculateExpectedDueDate } from "@/lib/pregnancyUtils";
import { MultiSelectSearchable } from "@/components/MultiSelectSearchable";
import { validateName, validatePhone, validateEmail, validateCNIC, handleNameInput, handlePhoneInput, handleCNICInput } from "@/lib/validations";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  father_name: string | null;
  email: string | null;
  phone: string;
  cnic: string | null;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  address: string | null;
  allergies: string | null;
  marital_status: string | null;
  medical_history: string | null;
  city: string | null;
  major_diseases: string | null;
  pregnancy_start_date: string | null;
  created_at: string;
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

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditHistoryDialogOpen, setIsEditHistoryDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [waitlistPatientIds, setWaitlistPatientIds] = useState<Set<string>>(new Set());
  const [addForm, setAddForm] = useState<{
    full_name: string;
    father_name: string;
    email: string;
    phone: string;
    cnic: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    blood_group: string;
    address: string;
    allergies: string;
    marital_status: string;
    city: string;
    major_diseases: string;
  }>({
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
  });
  const [dobDate, setDobDate] = useState<Date>();
  const [dobPopoverOpen, setDobPopoverOpen] = useState(false);
  const [editDobDate, setEditDobDate] = useState<Date>();
  const [editDobPopoverOpen, setEditDobPopoverOpen] = useState(false);
  
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [filterAge, setFilterAge] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [filterAddedDateFrom, setFilterAddedDateFrom] = useState<Date>();
  const [filterAddedDateTo, setFilterAddedDateTo] = useState<Date>();
  const [addedDateFromPopoverOpen, setAddedDateFromPopoverOpen] = useState(false);
  const [addedDateToPopoverOpen, setAddedDateToPopoverOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    father_name: string;
    email: string;
    phone: string;
    cnic: string;
    date_of_birth: string;
    gender: "male" | "female" | "other";
    blood_group: string;
    address: string;
    allergies: string;
    marital_status: string;
    city: string;
    major_diseases: string;
  }>({
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
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [newHistoryTitle, setNewHistoryTitle] = useState("");
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [newHistoryDate, setNewHistoryDate] = useState("");
  const [newHistoryDateObj, setNewHistoryDateObj] = useState<Date>();
  const [newHistoryDatePopoverOpen, setNewHistoryDatePopoverOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistoryEntry | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [documentDatePopoverOpen, setDocumentDatePopoverOpen] = useState(false);
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [pregnancyStartDate, setPregnancyStartDate] = useState<Date>();
  const [pregnancyStartDatePopoverOpen, setPregnancyStartDatePopoverOpen] = useState(false);
  const [editPregnancyStartDate, setEditPregnancyStartDate] = useState<Date>();
  const [editPregnancyStartDatePopoverOpen, setEditPregnancyStartDatePopoverOpen] = useState(false);
  const [allergyOptions, setAllergyOptions] = useState<{ value: string; label: string }[]>([]);
  const [diseaseOptions, setDiseaseOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [editSelectedAllergies, setEditSelectedAllergies] = useState<string[]>([]);
  const [editSelectedDiseases, setEditSelectedDiseases] = useState<string[]>([]);
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    checkDoctorSpecialization();
    fetchAllergyAndDiseaseOptions();
  }, []);

  const fetchAllergyAndDiseaseOptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get doctor's clinic_id
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("clinic_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!doctorData?.clinic_id) return;

    // Fetch allergies
    const { data: allergies } = await supabase
      .from("clinic_allergies")
      .select("name")
      .eq("clinic_id", doctorData.clinic_id)
      .order("name");

    if (allergies) {
      setAllergyOptions(allergies.map(a => ({ value: a.name, label: a.name })));
    }

    // Fetch diseases
    const { data: diseases } = await supabase
      .from("clinic_diseases")
      .select("name")
      .eq("clinic_id", doctorData.clinic_id)
      .order("name");

    if (diseases) {
      setDiseaseOptions(diseases.map(d => ({ value: d.name, label: d.name })));
    }
  };

  const checkDoctorSpecialization = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("doctors")
      .select("specialization")
      .eq("id", user.id)
      .maybeSingle();

    const isGyn = data?.specialization?.toLowerCase().includes("gynecologist") || false;
    setIsGynecologist(isGyn);
    // For gynecologists, default gender to female in add form
    if (isGyn) {
      setAddForm(prev => ({ ...prev, gender: "female" }));
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchWaitlistPatients();
  }, [currentPage, pageSize, filterAge, filterGender, filterCity, filterDelivery, searchTerm]);
  
  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchWaitlistPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("wait_list")
      .select("patient_id")
      .eq("doctor_id", user.id)
      .eq("status", "active");

    if (!error && data) {
      setWaitlistPatientIds(new Set(data.map(w => w.patient_id)));
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/doctor-auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roles || roles.role !== "doctor") {
      navigate("/");
    }
  };

  const fetchPatients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Build the query with search term
      let query = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm.trim()}%,patient_id.ilike.%${searchTerm.trim()}%`);
      }

      const hasGenderFilter = filterGender && filterGender !== "all";
      const hasCityFilter = filterCity && filterCity !== "all";
      
      if (hasGenderFilter) {
        query = query.eq("gender", filterGender as any);
      }
      if (hasCityFilter) {
        query = query.eq("city", filterCity);
      }

      const result = await query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (result.error) {
        console.error("Error fetching patients:", result.error);
        toast({ title: "Error fetching patients", variant: "destructive" });
        return;
      }

      let filteredData = (result.data || []) as unknown as Patient[];

      // Apply age filter if specified
      if (filterAge && filterAge !== "all") {
        filteredData = filteredData.filter(patient => {
          const today = new Date();
          const birthDate = new Date(patient.date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (filterAge === "0-18") return age <= 18;
          if (filterAge === "19-40") return age >= 19 && age <= 40;
          if (filterAge === "41-60") return age >= 41 && age <= 60;
          if (filterAge === "60+") return age > 60;
          return true;
        });
      }

      // Apply delivery date filter for gynecologists
      if (filterDelivery && filterDelivery !== "all") {
        filteredData = filteredData.filter(patient => {
          if (!patient.pregnancy_start_date) return false;
          
          const pregnancyStart = new Date(patient.pregnancy_start_date);
          const expectedDelivery = new Date(pregnancyStart);
          expectedDelivery.setDate(expectedDelivery.getDate() + 280); // 40 weeks
          
          const today = new Date();
          const daysUntilDelivery = Math.ceil((expectedDelivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (filterDelivery === "7") return daysUntilDelivery >= 0 && daysUntilDelivery <= 7;
          if (filterDelivery === "14") return daysUntilDelivery >= 0 && daysUntilDelivery <= 14;
          if (filterDelivery === "30") return daysUntilDelivery >= 0 && daysUntilDelivery <= 30;
          if (filterDelivery === "60") return daysUntilDelivery >= 0 && daysUntilDelivery <= 60;
          if (filterDelivery === "90") return daysUntilDelivery >= 0 && daysUntilDelivery <= 90;
          return true;
        });
      }

      // Apply added date filter
      if (filterAddedDateFrom) {
        filteredData = filteredData.filter(patient => {
          const createdAt = new Date(patient.created_at);
          return createdAt >= startOfDay(filterAddedDateFrom);
        });
      }
      if (filterAddedDateTo) {
        filteredData = filteredData.filter(patient => {
          const createdAt = new Date(patient.created_at);
          return createdAt <= endOfDay(filterAddedDateTo);
        });
      }

      setPatients(filteredData);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({ title: "Error fetching patients", variant: "destructive" });
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
    setEditPregnancyStartDate(patient.pregnancy_start_date ? new Date(patient.pregnancy_start_date) : undefined);
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;

    // Comprehensive validation
    const errors: string[] = [];
    
    const nameValidation = validateName(editForm.full_name);
    if (!nameValidation.isValid) errors.push(`Name: ${nameValidation.message}`);
    
    const phoneValidation = validatePhone(editForm.phone);
    if (!phoneValidation.isValid) errors.push(`Phone: ${phoneValidation.message}`);
    
    if (!editForm.date_of_birth) errors.push("Date of Birth is required");
    
    if (editForm.email) {
      const emailValidation = validateEmail(editForm.email, false);
      if (!emailValidation.isValid) errors.push(`Email: ${emailValidation.message}`);
    }
    
    if (editForm.cnic) {
      const cnicValidation = validateCNIC(editForm.cnic);
      if (!cnicValidation.isValid) errors.push(`CNIC: ${cnicValidation.message}`);
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    console.log("Update Patient - Form data:", editForm);
    console.log("Selected patient ID:", selectedPatient.id);

    const { data, error } = await supabase
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
        pregnancy_start_date: isGynecologist && editForm.gender === "female" && editPregnancyStartDate 
          ? format(editPregnancyStartDate, "yyyy-MM-dd") 
          : null,
      })
      .eq("id", selectedPatient.id)
      .select();

    if (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Error",
        description: `Failed to update patient: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    console.log("Patient updated successfully:", data);

    toast({
      title: "Success",
      description: "Patient updated successfully",
    });

    setIsEditDialogOpen(false);
    fetchPatients();
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", patientToDelete.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Patient deleted successfully",
    });

    setIsDeleteDialogOpen(false);
    setPatientToDelete(null);
    if (selectedPatient?.id === patientToDelete.id) {
      setSelectedPatient(null);
    }
    fetchPatients();
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
      .update({
        medical_history: JSON.stringify(updatedHistory),
      })
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

  const handleAddPatient = async () => {
    console.log("Add Patient - Form data:", addForm);
    
    // Comprehensive validation
    const errors: string[] = [];
    
    const nameValidation = validateName(addForm.full_name);
    if (!nameValidation.isValid) errors.push(`Name: ${nameValidation.message}`);
    
    const phoneValidation = validatePhone(addForm.phone);
    if (!phoneValidation.isValid) errors.push(`Phone: ${phoneValidation.message}`);
    
    if (!addForm.date_of_birth) errors.push("Date of Birth is required");
    
    if (addForm.email) {
      const emailValidation = validateEmail(addForm.email, false);
      if (!emailValidation.isValid) errors.push(`Email: ${emailValidation.message}`);
    }
    
    if (addForm.cnic) {
      const cnicValidation = validateCNIC(addForm.cnic);
      if (!cnicValidation.isValid) errors.push(`CNIC: ${cnicValidation.message}`);
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate patient ID
    const patientId = `PAT${Date.now().toString().slice(-8)}`;

    console.log("Inserting patient with data:", {
      full_name: addForm.full_name,
      phone: addForm.phone,
      date_of_birth: addForm.date_of_birth,
      gender: addForm.gender,
    });

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
          created_by: user.id,
          pregnancy_start_date: isGynecologist && addForm.gender === "female" && pregnancyStartDate 
            ? format(pregnancyStartDate, "yyyy-MM-dd") 
            : null,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: `Failed to add patient: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    console.log("Patient added successfully:", data);

    toast({
      title: "Success",
      description: "Patient added successfully",
    });

    setAddForm({
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
    });
    setDobDate(undefined);
    setPregnancyStartDate(undefined);
    setIsAddDialogOpen(false);
    fetchPatients();
  };

  const handleRowClick = (patient: Patient, event: React.MouseEvent) => {
    const row = (event.currentTarget as HTMLElement).closest('tr');
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
    } else {
      setSelectedPatient(patient);
      fetchMedicalHistory(patient);
      fetchDocuments(patient.id);
      
      // Scroll to the row after state update
      setTimeout(() => {
        row?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
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

  // Search is now server-side, so we just use patients directly
  const filteredPatients = patients;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Patients</h1>
        <p className="text-muted-foreground">View and manage your patients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle>Patients List</CardTitle>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterAge} onValueChange={setFilterAge}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="0-18">0-18 years</SelectItem>
                  <SelectItem value="19-40">19-40 years</SelectItem>
                  <SelectItem value="41-60">41-60 years</SelectItem>
                  <SelectItem value="60+">60+ years</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <CitySelect 
                value={filterCity} 
                onValueChange={setFilterCity}
                label=""
                showAllOption={true}
              />
              {isGynecologist && (
                <Select value={filterDelivery} onValueChange={setFilterDelivery}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Delivery Due" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="7">Delivery in 7 days</SelectItem>
                    <SelectItem value="14">Delivery in 14 days</SelectItem>
                    <SelectItem value="30">Delivery in 30 days</SelectItem>
                    <SelectItem value="60">Delivery in 2 months</SelectItem>
                    <SelectItem value="90">Delivery in 3 months</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="flex gap-2 items-center">
                <Popover open={addedDateFromPopoverOpen} onOpenChange={setAddedDateFromPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filterAddedDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterAddedDateFrom ? format(filterAddedDateFrom, "PP") : "From Date"}
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
                    <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filterAddedDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterAddedDateTo ? format(filterAddedDateTo, "PP") : "To Date"}
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-x border-t">
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
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <>
                      <TableRow
                        key={patient.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={(e) => handleRowClick(patient, e)}
                      >
                        <TableCell className="font-medium">{patient.patient_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {patient.full_name}
                            {waitlistPatientIds.has(patient.id) && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                Waitlist
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{patient.email || "N/A"}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="capitalize">{patient.gender}</TableCell>
                        <TableCell>{calculateAge(patient.date_of_birth)} years</TableCell>
                        <TableCell>{patient.blood_group || "N/A"}</TableCell>
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
                                    <div className="col-span-2">
                                      <p className="text-sm text-muted-foreground">Address</p>
                                      <p className="font-medium">{selectedPatient.address || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-muted-foreground">Allergies</p>
                                      <p className="font-medium">{selectedPatient.allergies || "N/A"}</p>
                                    </div>
                                    {isGynecologist && selectedPatient.gender === "female" && selectedPatient.pregnancy_start_date && (
                                      <>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Pregnancy Duration</p>
                                          <p className="font-medium text-primary">{calculatePregnancyDuration(selectedPatient.pregnancy_start_date)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Expected Delivery Date</p>
                                          <p className="font-medium text-primary">
                                            {calculateExpectedDueDate(selectedPatient.pregnancy_start_date) 
                                              ? format(calculateExpectedDueDate(selectedPatient.pregnancy_start_date)!, "PPP")
                                              : "N/A"}
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </TabsContent>
                                <TabsContent value="history" className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Medical History</h4>
                                    <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button size="sm">
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Entry
                                        </Button>
                                      </DialogTrigger>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
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
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Father Name</Label>
                <Input
                  value={addForm.father_name}
                  onChange={(e) => setAddForm({ ...addForm, father_name: e.target.value })}
                  placeholder="Enter father name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => {
                    setAddForm({ ...addForm, email: e.target.value });
                    if (e.target.value) {
                      const validation = validateEmail(e.target.value, false);
                      setAddFormErrors(prev => ({ ...prev, email: validation.isValid ? "" : validation.message }));
                    } else {
                      setAddFormErrors(prev => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="Enter email"
                  className={addFormErrors.email ? "border-destructive" : ""}
                />
                {addFormErrors.email && <p className="text-sm text-destructive">{addFormErrors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={addForm.phone}
                  onChange={(e) => {
                    const value = handlePhoneInput(e);
                    setAddForm({ ...addForm, phone: value });
                    const validation = validatePhone(value);
                    setAddFormErrors(prev => ({ ...prev, phone: validation.isValid ? "" : validation.message }));
                  }}
                  placeholder="Enter phone number"
                  className={addFormErrors.phone ? "border-destructive" : ""}
                />
                {addFormErrors.phone && <p className="text-sm text-destructive">{addFormErrors.phone}</p>}
              </div>
              <div>
                <Label>CNIC</Label>
                <Input
                  value={addForm.cnic}
                  onChange={(e) => {
                    const value = handleCNICInput(e);
                    setAddForm({ ...addForm, cnic: value });
                    if (value) {
                      const validation = validateCNIC(value);
                      setAddFormErrors(prev => ({ ...prev, cnic: validation.isValid ? "" : validation.message }));
                    } else {
                      setAddFormErrors(prev => ({ ...prev, cnic: "" }));
                    }
                  }}
                  placeholder="Enter CNIC (e.g., 12345-1234567-1)"
                  className={addFormErrors.cnic ? "border-destructive" : ""}
                />
                {addFormErrors.cnic && <p className="text-sm text-destructive">{addFormErrors.cnic}</p>}
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
                <Label>Gender *</Label>
                {isGynecologist ? (
                  <Input value="Female" disabled className="bg-muted" />
                ) : (
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
                )}
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
                    <SelectItem value="Don't Know">Don't Know</SelectItem>
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
                <MultiSelectSearchable
                  values={selectedAllergies}
                  onValuesChange={setSelectedAllergies}
                  options={allergyOptions}
                  label="Allergies"
                  placeholder="Select allergies"
                  searchPlaceholder="Search allergies..."
                  emptyMessage="No allergies found. Ask clinic to add allergies."
                />
              </div>
              <div className="col-span-2">
                <MultiSelectSearchable
                  values={selectedDiseases}
                  onValuesChange={setSelectedDiseases}
                  options={diseaseOptions}
                  label="Major Diseases"
                  placeholder="Select diseases"
                  searchPlaceholder="Search diseases..."
                  emptyMessage="No diseases found. Ask clinic to add diseases."
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
              {/* Pregnancy Start Date - Only for Gynecologists */}
              {isGynecologist && (
                <div className="col-span-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Label>Pregnancy Start Date (Optional)</Label>
                  <Popover open={pregnancyStartDatePopoverOpen} onOpenChange={setPregnancyStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !pregnancyStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pregnancyStartDate ? format(pregnancyStartDate, "PPP") : "Set pregnancy start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pregnancyStartDate}
                        onSelect={(date) => {
                          setPregnancyStartDate(date);
                          if (date) setPregnancyStartDatePopoverOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          const maxPastDate = new Date();
                          maxPastDate.setDate(maxPastDate.getDate() - 280);
                          return date > today || date < maxPastDate;
                        }}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can only select dates within the last 9 months (280 days)
                  </p>
                  {pregnancyStartDate && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-semibold text-primary">
                          {calculatePregnancyDuration(format(pregnancyStartDate, "yyyy-MM-dd"))}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Expected Due Date: </span>
                        <span className="font-semibold text-primary">
                          {calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd")) 
                            ? format(calculateExpectedDueDate(format(pregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                            : "-"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
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
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Father Name</Label>
                <Input
                  value={editForm.father_name}
                  onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })}
                  placeholder="Enter father name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    if (e.target.value) {
                      const validation = validateEmail(e.target.value, false);
                      setEditFormErrors(prev => ({ ...prev, email: validation.isValid ? "" : validation.message }));
                    } else {
                      setEditFormErrors(prev => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="Enter email"
                  className={editFormErrors.email ? "border-destructive" : ""}
                />
                {editFormErrors.email && <p className="text-sm text-destructive">{editFormErrors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => {
                    const value = handlePhoneInput(e);
                    setEditForm({ ...editForm, phone: value });
                    const validation = validatePhone(value);
                    setEditFormErrors(prev => ({ ...prev, phone: validation.isValid ? "" : validation.message }));
                  }}
                  placeholder="Enter phone number"
                  className={editFormErrors.phone ? "border-destructive" : ""}
                />
                {editFormErrors.phone && <p className="text-sm text-destructive">{editFormErrors.phone}</p>}
              </div>
              <div>
                <Label>CNIC</Label>
                <Input
                  value={editForm.cnic}
                  onChange={(e) => {
                    const value = handleCNICInput(e);
                    setEditForm({ ...editForm, cnic: value });
                    if (value) {
                      const validation = validateCNIC(value);
                      setEditFormErrors(prev => ({ ...prev, cnic: validation.isValid ? "" : validation.message }));
                    } else {
                      setEditFormErrors(prev => ({ ...prev, cnic: "" }));
                    }
                  }}
                  placeholder="Enter CNIC (e.g., 12345-1234567-1)"
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
                    <SelectItem value="Don't Know">Don't Know</SelectItem>
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
                <MultiSelectSearchable
                  values={editSelectedAllergies}
                  onValuesChange={setEditSelectedAllergies}
                  options={allergyOptions}
                  label="Allergies"
                  placeholder="Select allergies"
                  searchPlaceholder="Search allergies..."
                  emptyMessage="No allergies found. Ask clinic to add allergies."
                />
              </div>
              <div className="col-span-2">
                <MultiSelectSearchable
                  values={editSelectedDiseases}
                  onValuesChange={setEditSelectedDiseases}
                  options={diseaseOptions}
                  label="Major Diseases"
                  placeholder="Select diseases"
                  searchPlaceholder="Search diseases..."
                  emptyMessage="No diseases found. Ask clinic to add diseases."
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
              {/* Pregnancy Start Date - Only for Gynecologists and Female Patients */}
              {isGynecologist && editForm.gender === "female" && (
                <div className="col-span-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Label>Pregnancy Start Date (Optional)</Label>
                  <Popover open={editPregnancyStartDatePopoverOpen} onOpenChange={setEditPregnancyStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !editPregnancyStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editPregnancyStartDate ? format(editPregnancyStartDate, "PPP") : "Set pregnancy start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editPregnancyStartDate}
                        onSelect={(date) => {
                          setEditPregnancyStartDate(date);
                          if (date) setEditPregnancyStartDatePopoverOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          const maxPastDate = new Date();
                          maxPastDate.setDate(maxPastDate.getDate() - 280);
                          return date > today || date < maxPastDate;
                        }}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    Can only select dates within the last 9 months (280 days)
                  </p>
                  {editPregnancyStartDate && (
                    <div className="mt-2 p-2 bg-background rounded border">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-semibold text-primary">
                          {calculatePregnancyDuration(format(editPregnancyStartDate, "yyyy-MM-dd"))}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Expected Due Date: </span>
                        <span className="font-semibold text-primary">
                          {calculateExpectedDueDate(format(editPregnancyStartDate, "yyyy-MM-dd")) 
                            ? format(calculateExpectedDueDate(format(editPregnancyStartDate, "yyyy-MM-dd"))!, "PPP")
                            : "-"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
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

      {/* Edit History Dialog */}
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
            <Button variant="outline" onClick={() => {
              setIsEditHistoryDialogOpen(false);
              setEditingHistory(null);
              setNewHistoryTitle("");
              setNewHistoryDescription("");
              setNewHistoryDate("");
              setNewHistoryDateObj(undefined);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHistory}>Update Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the patient record and all associated data.
              This action cannot be undone.
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
    </div>
  );
};

export default DoctorPatients;
