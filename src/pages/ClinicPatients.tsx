import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Eye, ArrowLeft } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
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
                      {doctor.profiles.full_name}
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
    </div>
  );
};

export default ClinicPatients;
