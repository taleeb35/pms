import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Upload, FileText, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string | null;
  medical_history: string | null;
  created_at: string;
}

interface MedicalDocument {
  id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  created_at: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string | null;
  doctors: { profiles: { full_name: string } };
}

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    document_type: "",
    document_name: "",
    document_url: "",
  });

  useEffect(() => {
    if (id) {
      fetchPatientData();
      fetchDocuments();
      fetchAppointments();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setPatient(data);
    } catch (error: any) {
      toast({
        title: "Error fetching patient data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_documents")
        .select("*")
        .eq("patient_id", id)
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

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors(profiles(full_name))
        `)
        .eq("patient_id", id)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching appointments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async () => {
    try {
      const { error } = await supabase.from("medical_documents").insert({
        patient_id: id,
        ...uploadData,
      });

      if (error) throw error;

      toast({
        title: "Document uploaded successfully",
      });

      setUploadDialogOpen(false);
      setUploadData({ document_type: "", document_name: "", document_url: "" });
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading patient data...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{patient.full_name}</h2>
            <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/patients/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{age} years</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.blood_group || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gender</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{patient.gender}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Patient Details</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{patient.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p className="text-sm">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">{patient.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{patient.emergency_contact_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{patient.emergency_contact_phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                <p className="text-sm">{patient.allergies || "No known allergies"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Medical History</p>
                <p className="text-sm">{patient.medical_history || "No medical history recorded"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Appointment History</h3>
            <Button onClick={() => navigate(`/appointments/new?patient_id=${id}`)}>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{appointment.doctors.profiles.full_name}</p>
                          <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                        </p>
                        {appointment.reason && (
                          <p className="text-sm">{appointment.reason}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medical Documents</h3>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select
                      value={uploadData.document_type}
                      onValueChange={(value) => setUploadData({ ...uploadData, document_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab_result">Lab Result</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Name</Label>
                    <Input
                      value={uploadData.document_name}
                      onChange={(e) => setUploadData({ ...uploadData, document_name: e.target.value })}
                      placeholder="e.g., Blood Test Results"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document URL</Label>
                    <Input
                      value={uploadData.document_url}
                      onChange={(e) => setUploadData({ ...uploadData, document_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <Button onClick={handleUploadDocument} className="w-full">
                    Upload
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No documents uploaded</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {doc.document_type.replace("_", " ")} • {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
