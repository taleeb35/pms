import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Building2, Users, ChevronRight, Activity, LifeBuoy, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import clinicLogo from "@/assets/clinic-logo.png";

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

  const today = format(new Date(), "EEEE, dd MMM yyyy");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary/5 via-info/5 to-success/5 border-2 border-border/40 p-8 overflow-hidden group hover:shadow-xl transition-all duration-500">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-info/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo with hover effect */}
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-info/20 rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-4 shadow-lg group-hover/logo:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/10">
                <img src={clinicLogo} alt="MedCare Pro" className="h-16 w-16" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-warning animate-pulse opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 shadow-sm hover:shadow-md transition-shadow">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Admin Mode
                </Badge>
                <div className="h-1 w-1 rounded-full bg-border"></div>
                <span className="text-xs font-medium text-muted-foreground">{today}</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text">
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground text-base max-w-2xl">
                Complete system overview and clinic hierarchy management
              </p>
            </div>
          </div>
          
          <div className="text-right space-y-3">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-border/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                    {totalClinics}
                  </span>
                  <span className="text-xs text-muted-foreground">clinics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-info" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-info to-success bg-clip-text text-transparent">
                    {totalDoctors}
                  </span>
                  <span className="text-xs text-muted-foreground">doctors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clinics</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalClinics}</div>
            <p className="text-xs text-muted-foreground">Registered clinics</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Doctors</CardTitle>
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalDoctors}</div>
            <p className="text-xs text-muted-foreground">All registered doctors</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{approvedDoctors}</div>
            <p className="text-xs text-muted-foreground">Active & practicing</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40" onClick={() => navigate("/pending-doctors")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{pendingDoctors}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">In the system</p>
          </CardContent>
        </Card>
      </div>

      {/* Clinic Hierarchy */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clinics List */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedClinic === clinic.id 
                        ? "bg-primary/10 border-primary shadow-sm" 
                        : "border-border/40 hover:bg-accent/30 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedClinic(clinic.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-0.5">{clinic.clinic_name}</h3>
                          <p className="text-sm text-muted-foreground">{clinic.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {clinic.no_of_doctors}
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
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Stethoscope className="h-5 w-5 text-info" />
              {selectedClinic ? "Clinic Doctors" : "Select a Clinic"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedClinic ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Select a clinic to view its doctors</p>
              </div>
            ) : clinicDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No doctors registered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clinicDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 rounded-xl border border-border/40 hover:bg-accent/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/doctor-patients/${doctor.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                          <Stethoscope className="h-5 w-5 text-info" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-base">{doctor.profiles?.full_name || "Unknown Doctor"}</h4>
                            <Badge variant={doctor.approved ? "default" : "secondary"} className="text-xs">
                              {doctor.approved ? "Active" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {doctor.patient_count}
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
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick actions
            </CardTitle>
            <span className="text-sm text-muted-foreground">Shortcuts</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/doctors")} 
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5 text-info" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">View all doctors</div>
                  <div className="text-sm text-muted-foreground">Manage doctor records</div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate("/pending-doctors")} 
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Review pending doctors</div>
                  <div className="text-sm text-muted-foreground">{pendingDoctors} awaiting approval</div>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate("/support-tickets")} 
              className="w-full justify-start h-auto py-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-base">Support tickets</div>
                  <div className="text-sm text-muted-foreground">Review and respond</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
