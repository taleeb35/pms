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

const DoctorPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
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
                            onClick={() => setSelectedPatient(patient)}
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
                              <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Document
                                </Button>
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
