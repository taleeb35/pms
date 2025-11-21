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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/CitySelect";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  father_name: string | null;
  email: string | null;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  address: string | null;
  allergies: string | null;
  marital_status: string | null;
  medical_history: string | null;
  city: string | null;
  major_diseases: string | null;
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
  const [addForm, setAddForm] = useState<{
    full_name: string;
    father_name: string;
    email: string;
    phone: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [filterAge, setFilterAge] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [editForm, setEditForm] = useState<{
    full_name: string;
    father_name: string;
    email: string;
    phone: string;
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
  const [editingHistory, setEditingHistory] = useState<MedicalHistoryEntry | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [documentDatePopoverOpen, setDocumentDatePopoverOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [currentPage, pageSize, filterAge, filterGender, filterCity]);

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
      // @ts-ignore - Supabase query builder types can be overly complex
      const baseQuery = supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      let result;
      if (filterGender && filterCity) {
        // @ts-ignore
        result = await baseQuery
          .eq("gender", filterGender as any)
          .eq("city", filterCity)
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      } else if (filterGender) {
        // @ts-ignore
        result = await baseQuery
          .eq("gender", filterGender as any)
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      } else if (filterCity) {
        // @ts-ignore
        result = await baseQuery
          .eq("city", filterCity)
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      } else {
        result = await baseQuery
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      }

      if (result.error) {
        console.error("Error fetching patients:", result.error);
        toast({ title: "Error fetching patients", variant: "destructive" });
        return;
      }

      let filteredData = (result.data || []) as unknown as Patient[];

      // Apply age filter if specified
      if (filterAge) {
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
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;

    const { error } = await supabase
      .from("patients")
      .update({
        full_name: editForm.full_name,
        father_name: editForm.father_name || null,
        email: editForm.email || null,
        phone: editForm.phone,
        date_of_birth: editForm.date_of_birth,
        gender: editForm.gender,
        blood_group: editForm.blood_group || null,
        address: editForm.address || null,
        allergies: editForm.allergies || null,
        marital_status: editForm.marital_status || null,
        city: editForm.city || null,
        major_diseases: editForm.major_diseases || null,
      })
      .eq("id", selectedPatient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
      return;
    }

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
    if (!addForm.full_name || !addForm.phone || !addForm.date_of_birth) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate patient ID
    const patientId = `PAT${Date.now().toString().slice(-8)}`;

    const { error } = await supabase
      .from("patients")
      .insert([
        {
          full_name: addForm.full_name,
          father_name: addForm.father_name || null,
          email: addForm.email || null,
          phone: addForm.phone,
          date_of_birth: addForm.date_of_birth,
          gender: addForm.gender,
          blood_group: addForm.blood_group || null,
          address: addForm.address || null,
          allergies: addForm.allergies || null,
          marital_status: addForm.marital_status || null,
          city: addForm.city || null,
          major_diseases: addForm.major_diseases || null,
          patient_id: patientId,
          created_by: user.id,
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Patient added successfully",
    });

    setAddForm({
      full_name: "",
      father_name: "",
      email: "",
      phone: "",
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

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Patients</h1>
        <p className="text-muted-foreground">View and manage your patients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Patients List</CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
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
                        <TableCell>{patient.full_name}</TableCell>
                        <TableCell>{patient.email || "N/A"}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="capitalize">{patient.gender}</TableCell>
                        <TableCell>{calculateAge(patient.date_of_birth)} years</TableCell>
                        <TableCell>{patient.blood_group || "N/A"}</TableCell>
                      </TableRow>
                      {selectedPatient?.id === patient.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
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
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="info">Information</TabsTrigger>
                                  <TabsTrigger value="history">Medical History</TabsTrigger>
                                  <TabsTrigger value="documents">Documents</TabsTrigger>
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
                                            <Input
                                              type="date"
                                              value={newHistoryDate}
                                              onChange={(e) => setNewHistoryDate(e.target.value)}
                                            />
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
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
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
                          setAddForm({ ...addForm, date_of_birth: format(date, "yyyy-MM-dd") });
                          setDobPopoverOpen(false);
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
              <div className="col-span-2">
                <Label>Allergies</Label>
                <Textarea
                  value={addForm.allergies}
                  onChange={(e) => setAddForm({ ...addForm, allergies: e.target.value })}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
                  rows={2}
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
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
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
                          setEditForm({ ...editForm, date_of_birth: format(date, "yyyy-MM-dd") });
                          setEditDobPopoverOpen(false);
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
              <div className="col-span-2">
                <Label>Allergies</Label>
                <Textarea
                  value={editForm.allergies}
                  onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
                  rows={2}
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
              <Input
                type="date"
                value={newHistoryDate}
                onChange={(e) => setNewHistoryDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditHistoryDialogOpen(false);
              setEditingHistory(null);
              setNewHistoryTitle("");
              setNewHistoryDescription("");
              setNewHistoryDate("");
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
