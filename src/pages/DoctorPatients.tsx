import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Upload, Eye, Trash2, Edit, FileText, Plus, X } from "lucide-react";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  address: string | null;
  medical_history: string | null;
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
  const [uploading, setUploading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [addForm, setAddForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "male" as "male" | "female" | "other",
    blood_group: "",
    address: "",
  });
  const [editForm, setEditForm] = useState<{
    full_name: string;
    email: string;
    phone: string;
    gender: "male" | "female" | "other";
    blood_group: string;
  }>({
    full_name: "",
    email: "",
    phone: "",
    gender: "male",
    blood_group: "",
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [newHistoryTitle, setNewHistoryTitle] = useState("");
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchDocuments(selectedPatient.id);
      try {
        const history = selectedPatient.medical_history 
          ? JSON.parse(selectedPatient.medical_history) 
          : [];
        setMedicalHistory(Array.isArray(history) ? history : []);
      } catch {
        setMedicalHistory([]);
      }
    }
  }, [selectedPatient]);

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
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
      return;
    }

    setPatients(data || []);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedPatient) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedPatient.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical_documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("medical_documents")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("medical_documents")
        .insert({
          patient_id: selectedPatient.id,
          document_name: file.name,
          document_type: fileExt || "unknown",
          document_url: fileName,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      fetchDocuments(selectedPatient.id);
      event.target.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (documentUrl: string) => {
    const { data, error } = await supabase.storage
      .from("medical_documents")
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
        .from("medical_documents")
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

  const handleEditPatient = (patient: Patient) => {
    setEditForm({
      full_name: patient.full_name,
      email: patient.email || "",
      phone: patient.phone,
      gender: patient.gender as "male" | "female" | "other",
      blood_group: patient.blood_group || "",
    });
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return;

    const { error } = await supabase
      .from("patients")
      .update({
        full_name: editForm.full_name,
        email: editForm.email || null,
        phone: editForm.phone,
        gender: editForm.gender,
        blood_group: editForm.blood_group || null,
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

  const handleAddMedicalHistory = async () => {
    if (!selectedPatient || !newHistoryTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the medical history",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MedicalHistoryEntry = {
      id: Date.now().toString(),
      title: newHistoryTitle,
      description: newHistoryDescription,
      date: new Date().toISOString(),
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
    fetchPatients();
  };

  const handleDeleteMedicalHistory = async (id: string) => {
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

    const { error } = await supabase.from("patients").insert({
      patient_id: patientId,
      full_name: addForm.full_name,
      email: addForm.email || null,
      phone: addForm.phone,
      date_of_birth: addForm.date_of_birth,
      gender: addForm.gender,
      blood_group: addForm.blood_group || null,
      address: addForm.address || null,
      created_by: user.id,
    });

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

    setIsAddDialogOpen(false);
    setAddForm({
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "male",
      blood_group: "",
      address: "",
    });
    fetchPatients();
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Patients</h1>
        <p className="text-muted-foreground">View and manage your patients</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className={`cursor-pointer ${
                          selectedPatient?.id === patient.id
                            ? "bg-primary/10"
                            : ""
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <TableCell className="font-medium">{patient.patient_id}</TableCell>
                        <TableCell>{patient.full_name}</TableCell>
                        <TableCell>{patient.email || "N/A"}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell className="capitalize">{patient.gender}</TableCell>
                        <TableCell>{patient.blood_group || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedPatient.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Patient ID: {selectedPatient.patient_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPatient(selectedPatient)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPatientToDelete(selectedPatient);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="history">Medical History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedPatient.email || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-medium">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Gender</Label>
                        <p className="font-medium capitalize">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Blood Group</Label>
                        <p className="font-medium">{selectedPatient.blood_group || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Address</Label>
                        <p className="font-medium">{selectedPatient.address || "N/A"}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Medical Documents</Label>
                      <Button size="sm" disabled={uploading} asChild>
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload Document"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </label>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {documents.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No documents uploaded yet
                        </p>
                      ) : (
                        documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.document_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDocument(doc.document_url)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDocument(doc.id, doc.document_url)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Add New Medical History</Label>
                        <Input
                          placeholder="Title (e.g., Diabetes Type 2, Heart Surgery)"
                          value={newHistoryTitle}
                          onChange={(e) => setNewHistoryTitle(e.target.value)}
                        />
                        <Textarea
                          placeholder="Description (e.g., Diagnosed in 2020, controlled with medication)"
                          value={newHistoryDescription}
                          onChange={(e) => setNewHistoryDescription(e.target.value)}
                          rows={3}
                        />
                        <Button onClick={handleAddMedicalHistory}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add History
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <Label>Medical History Records</Label>
                        {medicalHistory.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            No medical history recorded yet
                          </p>
                        ) : (
                          medicalHistory.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-4 border rounded-lg space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 flex-1">
                                  <h4 className="font-semibold">{entry.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {entry.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Added: {new Date(entry.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMedicalHistory(entry.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                <Input
                  type="date"
                  value={addForm.date_of_birth}
                  onChange={(e) => setAddForm({ ...addForm, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(value) => setAddForm({ ...addForm, gender: value as "male" | "female" | "other" })}
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
                <Input
                  value={addForm.blood_group}
                  onChange={(e) => setAddForm({ ...addForm, blood_group: e.target.value })}
                  placeholder="e.g., A+, B-, O+"
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Enter address"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>Add Patient</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value) => setEditForm({ ...editForm, gender: value as "male" | "female" | "other" })}
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
              <Input
                value={editForm.blood_group}
                onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                placeholder="e.g., A+, B-, O+"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePatient}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the patient record for{" "}
              <strong>{patientToDelete?.full_name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoctorPatients;
