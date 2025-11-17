import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Upload, UserPlus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  gender: string;
  date_of_birth: string;
  blood_group: string | null;
  address: string | null;
  allergies: string | null;
  medical_history: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

interface MedicalDocument {
  id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  created_at: string;
}

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching patients",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    return (
      patient.full_name.toLowerCase().includes(term) ||
      patient.patient_id.toLowerCase().includes(term) ||
      patient.phone.includes(term) ||
      (patient.email && patient.email.toLowerCase().includes(term))
    );
  });

  const fetchDocuments = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from("medical_documents")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = async (documentUrl: string) => {
    try {
      // Extract the file path from the URL
      const urlParts = documentUrl.split('/medical-documents/');
      if (urlParts.length < 2) {
        throw new Error("Invalid document URL");
      }
      const filePath = urlParts[1];

      // Create a signed URL that expires in 1 hour
      const { data, error } = await supabase.storage
        .from("medical-documents")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error viewing document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (documentId: string, documentUrl: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Extract the file path from the URL
      const urlParts = documentUrl.split('/medical-documents/');
      if (urlParts.length < 2) {
        throw new Error("Invalid document URL");
      }
      const filePath = urlParts[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("medical-documents")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("medical_documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      if (selectedPatient) {
        fetchDocuments(selectedPatient.id);
      }
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!file || !title) {
      toast({
        title: "Error",
        description: "Please provide both title and file",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedPatient.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the full path for later retrieval
      const documentUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/medical-documents/${fileName}`;

      // Save document metadata
      const { error: dbError } = await supabase
        .from("medical_documents")
        .insert({
          patient_id: selectedPatient.id,
          document_name: title,
          document_type: fileExt || "unknown",
          document_url: documentUrl,
          uploaded_by: user?.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      form.reset();
      setShowUploadDialog(false);
      fetchDocuments(selectedPatient.id);
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const patientId = `PAT${Date.now().toString().slice(-8)}`;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("patients").insert({
        patient_id: patientId,
        full_name: formData.get("full_name") as string,
        email: formData.get("email") as string || null,
        phone: formData.get("phone") as string,
        gender: formData.get("gender") as any,
        date_of_birth: formData.get("date_of_birth") as string,
        blood_group: formData.get("blood_group") as string || null,
        address: formData.get("address") as string || null,
        allergies: formData.get("allergies") as string || null,
        medical_history: formData.get("medical_history") as string || null,
        emergency_contact_name: formData.get("emergency_contact_name") as string || null,
        emergency_contact_phone: formData.get("emergency_contact_phone") as string || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Patient registered with ID: ${patientId}`,
      });

      setShowAddDialog(false);
      fetchPatients();
    } catch (error: any) {
      toast({
        title: "Error adding patient",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">Register and manage patient records</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Patient Registration</DialogTitle>
              <DialogDescription>Add a new patient to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Input id="blood_group" name="blood_group" placeholder="e.g., O+" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" name="allergies" placeholder="List any known allergies" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical_history">Medical History</Label>
                <Textarea id="medical_history" name="medical_history" placeholder="Previous medical conditions" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input id="emergency_contact_name" name="emergency_contact_name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Register Patient</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No patients found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.patient_id}</TableCell>
                    <TableCell>{patient.full_name}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell className="capitalize">{patient.gender}</TableCell>
                    <TableCell>{patient.blood_group || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient);
                              fetchDocuments(patient.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Patient Details</DialogTitle>
                          </DialogHeader>
                          {selectedPatient && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
                                  <p className="text-sm">{selectedPatient.patient_id}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                  <p className="text-sm">{selectedPatient.full_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                                  <p className="text-sm">{selectedPatient.email || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                  <p className="text-sm">{selectedPatient.phone}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                                  <p className="text-sm capitalize">{selectedPatient.gender}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                                  <p className="text-sm">{new Date(selectedPatient.date_of_birth).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                                  <p className="text-sm">{selectedPatient.blood_group || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                                  <p className="text-sm">{selectedPatient.address || "N/A"}</p>
                                </div>
                              </div>
                              {selectedPatient.allergies && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Allergies</p>
                                  <p className="text-sm">{selectedPatient.allergies}</p>
                                </div>
                              )}
                              {selectedPatient.medical_history && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Medical History</p>
                                  <p className="text-sm">{selectedPatient.medical_history}</p>
                                </div>
                              )}
                              {(selectedPatient.emergency_contact_name || selectedPatient.emergency_contact_phone) && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                                    <p className="text-sm">{selectedPatient.emergency_contact_name || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                                    <p className="text-sm">{selectedPatient.emergency_contact_phone || "N/A"}</p>
                                  </div>
                                </div>
                              )}
                              {documents.length > 0 && (
                                <div className="mt-6 pt-4 border-t">
                                  <h3 className="text-sm font-semibold mb-3">Uploaded Documents</h3>
                                  <div className="space-y-2">
                                    {documents.map((doc) => (
                                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{doc.document_name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(doc.created_at).toLocaleDateString()} • {doc.document_type.toUpperCase()}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDocument(doc.document_url)}
                                          >
                                            View
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteDocument(doc.id, doc.document_url)}
                                            className="text-destructive hover:text-destructive"
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-4">
                                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Document
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Upload Document</DialogTitle>
                                      <DialogDescription>
                                        Upload a medical document for {selectedPatient?.full_name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUploadDocument} className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="title">Document Title</Label>
                                        <Input
                                          id="title"
                                          name="title"
                                          placeholder="e.g., Blood Test Report"
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="file">File</Label>
                                        <Input
                                          id="file"
                                          name="file"
                                          type="file"
                                          accept="image/*,.pdf,.doc,.docx"
                                          required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                          Accepted formats: PDF, Images, Word documents
                                        </p>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => setShowUploadDialog(false)}
                                        >
                                          Cancel
                                        </Button>
                                        <Button type="submit" disabled={uploadingDoc}>
                                          {uploadingDoc ? "Uploading..." : "Upload"}
                                        </Button>
                                      </div>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPatients;
