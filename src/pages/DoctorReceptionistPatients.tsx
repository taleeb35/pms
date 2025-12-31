import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";
import { validateName, validateEmail, validatePhone, validateCNIC, handleNameInput, handlePhoneInput, handleCNICInput } from "@/lib/validations";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { CitySelect } from "@/components/CitySelect";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { logActivity } from "@/lib/activityLogger";
import { MultiSelectSearchable } from "@/components/MultiSelectSearchable";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  city: string | null;
  created_at: string;
}

const DoctorReceptionistPatients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Allergy and disease options
  const [allergyOptions, setAllergyOptions] = useState<{ value: string; label: string }[]>([]);
  const [diseaseOptions, setDiseaseOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    email: "",
    phone: "",
    cnic: "",
    dateOfBirth: "",
    gender: "male",
    bloodGroup: "",
    city: "",
    address: "",
    maritalStatus: "",
  });

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
      fetchAllergyAndDiseaseOptions();
    }
  }, [doctorId]);

  const fetchAllergyAndDiseaseOptions = async () => {
    if (!doctorId) return;

    // Fetch doctor allergies
    const { data: allergies } = await supabase
      .from("doctor_allergies")
      .select("name")
      .eq("doctor_id", doctorId)
      .order("name");

    if (allergies) {
      setAllergyOptions(allergies.map(a => ({ value: a.name, label: a.name })));
    }

    // Fetch doctor diseases
    const { data: diseases } = await supabase
      .from("doctor_diseases")
      .select("name")
      .eq("doctor_id", doctorId)
      .order("name");

    if (diseases) {
      setDiseaseOptions(diseases.map(d => ({ value: d.name, label: d.name })));
    }
  };

  const fetchPatients = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("created_by", doctorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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

  const generatePatientId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `P-${timestamp}${random}`;
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      fatherName: "",
      email: "",
      phone: "",
      cnic: "",
      dateOfBirth: "",
      gender: "male",
      bloodGroup: "",
      city: "",
      address: "",
      maritalStatus: "",
    });
    setSelectedAllergies([]);
    setSelectedDiseases([]);
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;

    const nameValidation = validateName(formData.fullName);
    if (!nameValidation.isValid) {
      toast({ title: "Validation Error", description: nameValidation.message, variant: "destructive" });
      return;
    }

    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        toast({ title: "Validation Error", description: emailValidation.message, variant: "destructive" });
        return;
      }
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      toast({ title: "Validation Error", description: phoneValidation.message, variant: "destructive" });
      return;
    }

    if (formData.cnic) {
      const cnicValidation = validateCNIC(formData.cnic);
      if (!cnicValidation.isValid) {
        toast({ title: "Validation Error", description: cnicValidation.message, variant: "destructive" });
        return;
      }
    }

    if (!formData.dateOfBirth) {
      toast({ title: "Validation Error", description: "Date of birth is required", variant: "destructive" });
      return;
    }

    setFormLoading(true);
    const patientIdGenerated = generatePatientId();

    try {
      const { data, error } = await supabase.from("patients").insert({
        patient_id: patientIdGenerated,
        full_name: formData.fullName,
        father_name: formData.fatherName || null,
        email: formData.email || null,
        phone: formData.phone,
        cnic: formData.cnic || null,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as "male" | "female" | "other",
        blood_group: formData.bloodGroup || null,
        city: formData.city || null,
        address: formData.address || null,
        marital_status: formData.maritalStatus || null,
        allergies: selectedAllergies.length > 0 ? selectedAllergies.join(", ") : null,
        major_diseases: selectedDiseases.length > 0 ? selectedDiseases.join(", ") : null,
        created_by: doctorId,
      }).select();

      if (error) throw error;

      // Log activity with doctorId
      if (data && data[0]) {
        await logActivity({
          action: "patient_created",
          entityType: "patient",
          entityId: data[0].id,
          details: {
            doctorId: doctorId,
            patient_name: formData.fullName,
            patient_id: patientIdGenerated,
          },
        });
      }

      toast({ title: "Success", description: "Patient added successfully" });
      resetForm();
      setAddDialogOpen(false);
      fetchPatients();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), parseISO(dob));
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(query) ||
      p.patient_id.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (doctorLoading || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter patient details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: handleNameInput(e) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: handleNameInput(e) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: handlePhoneInput(e) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNIC</Label>
                  <Input
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: handleCNICInput(e) })}
                    placeholder="00000-0000000-0"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(v) => setFormData({ ...formData, maritalStatus: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <CitySelect value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <MultiSelectSearchable
                    options={allergyOptions}
                    values={selectedAllergies}
                    onValuesChange={setSelectedAllergies}
                    placeholder="Select allergies..."
                    emptyMessage="No allergies found"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Major Diseases</Label>
                  <MultiSelectSearchable
                    options={diseaseOptions}
                    values={selectedDiseases}
                    onValuesChange={setSelectedDiseases}
                    placeholder="Select diseases..."
                    emptyMessage="No diseases found"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? "Adding..." : "Add Patient"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No patients found" : "No patients registered yet"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-sm">{patient.patient_id}</TableCell>
                      <TableCell className="font-medium">{patient.full_name}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>
                        {calculateAge(patient.date_of_birth)} yrs / {patient.gender === "male" ? "M" : patient.gender === "female" ? "F" : "O"}
                      </TableCell>
                      <TableCell>{patient.blood_group || "-"}</TableCell>
                      <TableCell>{patient.city || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/doctor-receptionist/patients/${patient.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between py-4 px-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {paginatedPatients.length} of {filteredPatients.length} patients
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReceptionistPatients;
