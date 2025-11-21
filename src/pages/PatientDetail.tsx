import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Upload, Eye, Trash2, Edit, Plus, X, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { format, differenceInYears } from "date-fns";
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

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [documentDatePopoverOpen, setDocumentDatePopoverOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditHistoryDialogOpen, setIsEditHistoryDialogOpen] = useState(false);
  const [newHistoryTitle, setNewHistoryTitle] = useState("");
  const [newHistoryDescription, setNewHistoryDescription] = useState("");
  const [newHistoryDate, setNewHistoryDate] = useState("");
  const [newHistoryDateObj, setNewHistoryDateObj] = useState<Date>();
  const [newHistoryDatePopoverOpen, setNewHistoryDatePopoverOpen] = useState(false);
  const [editingHistory, setEditingHistory] = useState<MedicalHistoryEntry | null>(null);
  const [editDobDate, setEditDobDate] = useState<Date>();
  const [editDobPopoverOpen, setEditDobPopoverOpen] = useState(false);
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
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPatient();
      fetchDocuments();
    }
  }, [id]);

  useEffect(() => {
    if (editDobDate) {
      setEditForm(prev => ({ ...prev, date_of_birth: format(editDobDate, 'yyyy-MM-dd') }));
    }
  }, [editDobDate]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPatient(data);
      fetchMedicalHistory(data);
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

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from("medical_documents")
      .select("*")
      .eq("patient_id", id)
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

      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile || !documentTitle.trim() || !documentDate || !patient) {
      toast({ title: "Please provide title, date and file", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileExt = documentFile.name.split(".").pop();
      const fileName = `${patient.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(fileName, documentFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("medical_documents")
        .insert({
          patient_id: patient.id,
          document_name: documentTitle,
          document_type: documentFile.type,
          document_url: fileName,
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
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = () => {
    if (!patient) return;
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
    setIsEditDialogOpen(true);
  };

  const handleUpdatePatient = async () => {
    if (!patient) return;

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
      .eq("id", patient.id);

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
    fetchPatient();
  };

  const handleAddHistory = async () => {
    if (!patient || !newHistoryTitle.trim() || !newHistoryDate) {
      toast({
        title: "Error",
        description: "Please enter title and date",
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
      .eq("id", patient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add history",
        variant: "destructive",
      });
      return;
    }

    setMedicalHistory(updatedHistory);
    setNewHistoryTitle("");
    setNewHistoryDescription("");
    setNewHistoryDate("");
    setIsHistoryDialogOpen(false);
    toast({ title: "Success", description: "Medical history added" });
  };

  const handleUpdateHistory = async () => {
    if (!editingHistory || !patient) return;

    const updatedHistory = medicalHistory.map(h =>
      h.id === editingHistory.id ? editingHistory : h
    );

    const { error } = await supabase
      .from("patients")
      .update({ medical_history: JSON.stringify(updatedHistory) })
      .eq("id", patient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update history",
        variant: "destructive",
      });
      return;
    }

    setMedicalHistory(updatedHistory);
    setEditingHistory(null);
    setIsEditHistoryDialogOpen(false);
    toast({ title: "Success", description: "Medical history updated" });
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!patient) return;

    const updatedHistory = medicalHistory.filter(h => h.id !== historyId);

    const { error } = await supabase
      .from("patients")
      .update({ medical_history: JSON.stringify(updatedHistory) })
      .eq("id", patient.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete history",
        variant: "destructive",
      });
      return;
    }

    setMedicalHistory(updatedHistory);
    toast({ title: "Success", description: "Medical history deleted" });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!patient) {
    return <div className="flex items-center justify-center h-full">Patient not found</div>;
  }

  const age = differenceInYears(new Date(), new Date(patient.date_of_birth));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{patient.full_name}</h2>
          <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
        </div>
        <Button onClick={handleEditPatient}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Patient
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Patient Information</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{patient.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Father Name</Label>
                <p className="font-medium">{patient.father_name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{patient.email || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{patient.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{format(new Date(patient.date_of_birth), "PPP")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Age</Label>
                <p className="font-medium">{age} years</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{patient.gender}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Blood Group</Label>
                <p className="font-medium">{patient.blood_group || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Marital Status</Label>
                <p className="font-medium capitalize">{patient.marital_status || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">City</Label>
                <p className="font-medium">{patient.city || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{patient.address || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Allergies</Label>
                <p className="font-medium">{patient.allergies || "None"}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Major Diseases</Label>
                <p className="font-medium">{patient.major_diseases || "None"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Medical History</CardTitle>
                <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add History
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medical History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newHistoryTitle}
                          onChange={(e) => setNewHistoryTitle(e.target.value)}
                          placeholder="e.g., Diabetes diagnosed"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newHistoryDescription}
                          onChange={(e) => setNewHistoryDescription(e.target.value)}
                          placeholder="Additional details..."
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
                                !newHistoryDateObj && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newHistoryDateObj ? format(newHistoryDateObj, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newHistoryDateObj}
                              onSelect={(date) => {
                                setNewHistoryDateObj(date);
                                if (date) {
                                  setNewHistoryDate(format(date, "yyyy-MM-dd"));
                                  setNewHistoryDatePopoverOpen(false);
                                }
                              }}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddHistory}>Add History</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {medicalHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No medical history recorded
                </p>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{entry.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {entry.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(entry.date), "PPP")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingHistory(entry);
                                setIsEditHistoryDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteHistory(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Medical Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Document title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                  />
                  <Popover open={documentDatePopoverOpen} onOpenChange={setDocumentDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !documentDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {documentDate ? format(new Date(documentDate), "PPP") : "Pick date"}
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
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="file"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  />
                  <Button onClick={handleUploadDocument}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>

                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.document_name}</TableCell>
                          <TableCell>
                            {format(new Date(doc.created_at), "PPP")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDocument(doc.document_url)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id, doc.document_url)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Father Name</Label>
              <Input
                value={editForm.father_name}
                onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })}
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
              <Label>Date of Birth</Label>
              <Popover open={editDobPopoverOpen} onOpenChange={setEditDobPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editDobDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDobDate ? format(editDobDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDobDate}
                    onSelect={(date) => {
                      setEditDobDate(date);
                      setEditDobPopoverOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={editForm.gender}
                onValueChange={(value: "male" | "female" | "other") =>
                  setEditForm({ ...editForm, gender: value })
                }
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
              />
            </div>
            <div>
              <Label>Marital Status</Label>
              <Select
                value={editForm.marital_status}
                onValueChange={(value) => setEditForm({ ...editForm, marital_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>City</Label>
              <CitySelect
                value={editForm.city}
                onValueChange={(value) => setEditForm({ ...editForm, city: value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Allergies</Label>
              <Textarea
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label>Major Diseases</Label>
              <Textarea
                value={editForm.major_diseases}
                onChange={(e) => setEditForm({ ...editForm, major_diseases: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePatient}>Update Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit History Dialog */}
      <Dialog open={isEditHistoryDialogOpen} onOpenChange={setIsEditHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medical History</DialogTitle>
          </DialogHeader>
          {editingHistory && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingHistory.title}
                  onChange={(e) =>
                    setEditingHistory({ ...editingHistory, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingHistory.description}
                  onChange={(e) =>
                    setEditingHistory({ ...editingHistory, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(editingHistory.date), "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(editingHistory.date)}
                      onSelect={(date) => {
                        if (date) {
                          setEditingHistory({
                            ...editingHistory,
                            date: format(date, "yyyy-MM-dd"),
                          });
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateHistory}>Update History</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetail;