import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Users, Building2, Plus, AlertCircle, LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Clinic {
  clinic_name: string;
  no_of_doctors: number;
}

interface Doctor {
  id: string;
  specialization: string;
  approved: boolean;
  profiles: {
    full_name: string;
    email: string;
  };
}

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const DOCTOR_LIMIT = 5;

  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      
      setUser(currentUser);

      // Fetch clinic data
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("clinic_name, no_of_doctors")
        .eq("id", currentUser.id)
        .single();

      if (clinicError) throw clinicError;
      setClinic(clinicData);

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select(`
          id,
          specialization,
          approved,
          profiles(full_name, email)
        `)
        .eq("clinic_id", currentUser.id);

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);
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

  const canAddMoreDoctors = doctors.length < DOCTOR_LIMIT;
  const isAtLimit = doctors.length >= DOCTOR_LIMIT;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Clinic Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your clinic and doctors
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clinic Name</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinic?.clinic_name || "Loading..."}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.length} / {DOCTOR_LIMIT}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {DOCTOR_LIMIT - doctors.length} slots available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.filter(d => d.approved).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved by admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Limit Alert */}
      {isAtLimit && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You've reached your doctor limit ({DOCTOR_LIMIT} doctors). To add more doctors, please contact support and request a limit increase.
          </AlertDescription>
        </Alert>
      )}

      {/* Doctor Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Doctors</CardTitle>
              <CardDescription>Manage doctors registered under your clinic</CardDescription>
            </div>
            <div className="flex gap-2">
              {isAtLimit && (
                <Button
                  onClick={() => navigate("/clinic/support")}
                  variant="outline"
                  className="gap-2"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Request More Capacity
                </Button>
              )}
              <Button
                onClick={() => navigate("/clinic/add-doctor")}
                disabled={!canAddMoreDoctors}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Doctor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No doctors added yet</p>
              <Button onClick={() => navigate("/clinic/add-doctor")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Doctor
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doctor.profiles.full_name}</h4>
                        <Badge variant={doctor.approved ? "default" : "secondary"}>
                          {doctor.approved ? "Active" : "Pending Approval"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doctor.profiles.email}</p>
                    </div>
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => navigate("/clinic/add-doctor")}
              disabled={!canAddMoreDoctors}
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <Plus className="h-4 w-4" />
                  Add New Doctor
                </div>
                <p className="text-xs text-muted-foreground font-normal">
                  Register a new doctor to your clinic
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/clinic/support")}
              className="justify-start h-auto py-4"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <LifeBuoy className="h-4 w-4" />
                  Contact Support
                </div>
                <p className="text-xs text-muted-foreground font-normal">
                  Get help or request doctor limit increase
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDashboard;
