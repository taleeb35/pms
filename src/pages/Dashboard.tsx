import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stethoscope, Building2, Users, ChevronRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Clinic {
  id: string;
  clinic_name: string;
  city: string;
  phone_number: string;
  address: string;
  no_of_doctors: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface DoctorWithPatientCount {
  id: string;
  specialization: string;
  approved: boolean;
  clinic_id: string | null;
  profiles: {
    full_name: string;
    email: string;
  };
  patient_count: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [approvedDoctors, setApprovedDoctors] = useState(0);
  const [pendingDoctors, setPendingDoctors] = useState(0);
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [clinicDoctors, setClinicDoctors] = useState<DoctorWithPatientCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchClinicDoctors(selectedClinic);
    }
  }, [selectedClinic]);

  const fetchStats = async () => {
    const { count: totalCount } = await supabase
      .from("doctors")
      .select("id", { count: "exact", head: true });

    const { count: approvedCount } = await supabase
      .from("doctors")
      .select("id", { count: "exact", head: true })
      .eq("approved", true);

    const { count: pendingCount } = await supabase
      .from("doctors")
      .select("id", { count: "exact", head: true })
      .eq("approved", false);

    const { count: clinicCount } = await supabase
      .from("clinics")
      .select("id", { count: "exact", head: true });

    const { count: patientCount } = await supabase
      .from("patients")
      .select("id", { count: "exact", head: true });

    setTotalDoctors(totalCount || 0);
    setApprovedDoctors(approvedCount || 0);
    setPendingDoctors(pendingCount || 0);
    setTotalClinics(clinicCount || 0);
    setTotalPatients(patientCount || 0);
  };

  const fetchClinics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinics")
      .select(`
        *,
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch doctor counts for each clinic
      const clinicsWithCounts = await Promise.all(
        data.map(async (clinic) => {
          const { count } = await supabase
            .from("doctors")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", clinic.id);
          return { ...clinic, no_of_doctors: count || 0 };
        })
      );
      setClinics(clinicsWithCounts);
    }
    setLoading(false);
  };

  const fetchClinicDoctors = async (clinicId: string) => {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        id,
        specialization,
        approved,
        clinic_id,
        profiles(full_name, email)
      `)
      .eq("clinic_id", clinicId);

    if (!error && doctors) {
      // Fetch patient counts for each doctor
      const doctorsWithCounts = await Promise.all(
        doctors.map(async (doctor) => {
          const { count } = await supabase
            .from("patients")
            .select("id", { count: "exact", head: true })
            .eq("created_by", doctor.id);
          return { ...doctor, patient_count: count || 0 };
        })
      );
      setClinicDoctors(doctorsWithCounts);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground">Complete system overview and clinic hierarchy</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClinics}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDoctors}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Stethoscope className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedDoctors}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/pending-doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Stethoscope className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDoctors}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Hierarchy */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clinics List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Registered Clinics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading clinics...</p>
            ) : clinics.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No clinics registered yet</p>
            ) : (
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedClinic === clinic.id ? "bg-primary/10 border-primary" : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedClinic(clinic.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{clinic.clinic_name}</h3>
                        <p className="text-sm text-muted-foreground">{clinic.city}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {clinic.profiles.full_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {clinic.no_of_doctors} {clinic.no_of_doctors === 1 ? "Doctor" : "Doctors"}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctors under selected clinic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              {selectedClinic ? "Clinic Doctors" : "Select a Clinic"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedClinic ? (
              <p className="text-center text-muted-foreground py-8">
                Select a clinic to view its doctors
              </p>
            ) : clinicDoctors.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No doctors registered in this clinic yet
              </p>
            ) : (
              <div className="space-y-2">
                {clinicDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-all hover:shadow-md cursor-pointer"
                    onClick={() => navigate(`/admin/doctor-patients/${doctor.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{doctor.profiles.full_name}</h4>
                          <Badge variant={doctor.approved ? "default" : "secondary"}>
                            {doctor.approved ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground mt-1">{doctor.profiles.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {doctor.patient_count} {doctor.patient_count === 1 ? "Patient" : "Patients"}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" onClick={() => navigate("/doctors")} className="justify-start">
              <Stethoscope className="mr-2 h-4 w-4" />
              View All Doctors
            </Button>
            <Button variant="outline" onClick={() => navigate("/pending-doctors")} className="justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Review Pending Doctors
            </Button>
            <Button variant="outline" onClick={() => navigate("/support-tickets")} className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Support Tickets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
