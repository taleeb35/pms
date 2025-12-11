import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Eye, ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  gender: string;
  date_of_birth: string;
  blood_group: string | null;
  city: string | null;
  created_by: string | null;
}

interface Doctor {
  id: string;
  profiles: {
    full_name: string;
  };
}

const ClinicPatients = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdFromParams = searchParams.get("doctorId");
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctorIdFromParams || "all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const { toast } = useToast();

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
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync dobDate with addForm.date_of_birth
  useEffect(() => {
    if (dobDate) {
      setAddForm(prev => ({ ...prev, date_of_birth: format(dobDate, 'yyyy-MM-dd') }));
    }
  }, [dobDate]);

  const cities = [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Hyderabad",
    "Gujranwala", "Peshawar", "Quetta", "Islamabad", "Sialkot", "Bahawalpur",
  ];

  useEffect(() => {
    fetchDoctorsAndPatients();
  }, []);

  useEffect(() => {
    if (doctorIdFromParams) {
      setSelectedDoctor(doctorIdFromParams);
    }
  }, [doctorIdFromParams]);

  const fetchDoctorsAndPatients = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch doctors under this clinic
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("clinic_id", user.id);

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);

      // Fetch all patients created by doctors of this clinic
      const doctorIds = doctorsData?.map(d => d.id) || [];
      
      if (doctorIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("*")
          .in("created_by", doctorIds)
          .order("created_at", { ascending: false });

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);
      }
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

  const getFilteredPatients = () => {
    let filtered = [...patients];

    // Filter by doctor
    if (selectedDoctor !== "all") {
      filtered = filtered.filter(p => p.created_by === selectedDoctor);
    }

    // Filter by gender
    if (selectedGender !== "all") {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }

    // Filter by city
    if (selectedCity !== "all") {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    // Filter by age
    if (ageFilter !== "all") {
      filtered = filtered.filter(p => {
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

    return filtered;
  };

  const filteredPatients = getFilteredPatients();

  const getDoctorName = (doctorId: string | null) => {
    if (!doctorId) return "Unknown";
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.profiles?.full_name || "Unknown";
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
      toast({ title: "Please fix the validation errors", variant: "destructive" });
      return;
    }

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
          cnic: addForm.cnic || null,
          date_of_birth: addForm.date_of_birth,
          gender: addForm.gender,
          blood_group: addForm.blood_group || null,
          address: addForm.address || null,
          allergies: addForm.allergies || null,
          marital_status: addForm.marital_status || null,
          city: addForm.city || null,
          major_diseases: addForm.major_diseases || null,
          patient_id: patientId,
          created_by: addForm.doctor_id,
        },
      ]);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to add patient: ${error.message}`,
        variant: "destructive",
      });
      return;
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
    });
    setDobDate(undefined);
    setIsAddDialogOpen(false);
    fetchDoctorsAndPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">All Patients</CardTitle>
          <CardDescription>
            View and manage all patients from your clinic doctors ({filteredPatients.length} patients)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading patients...</p>
          ) : filteredPatients.length === 0 ? (
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
                    <TableHead>City</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-sm">{patient.patient_id}</TableCell>
                      <TableCell className="font-semibold">{patient.full_name}</TableCell>
                      <TableCell>{patient.email || "-"}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell className="capitalize">{patient.gender}</TableCell>
                      <TableCell>{calculateAge(patient.date_of_birth)} years</TableCell>
                      <TableCell>{patient.blood_group || "-"}</TableCell>
                      <TableCell>{patient.city || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getDoctorName(patient.created_by)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/clinic/patients/${patient.id}`)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                <Textarea
                  value={addForm.allergies}
                  onChange={(e) => setAddForm({ ...addForm, allergies: e.target.value })}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Major Diseases</Label>
                <Textarea
                  value={addForm.major_diseases}
                  onChange={(e) => setAddForm({ ...addForm, major_diseases: e.target.value })}
                  placeholder="List any major diseases"
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
    </div>
  );
};

export default ClinicPatients;