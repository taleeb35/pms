import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/SearchableSelect";

const ClinicAddDoctor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canAddDoctor, setCanAddDoctor] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [requestedDoctors, setRequestedDoctors] = useState(0);
  const [specializations, setSpecializations] = useState<string[]>([]);
  
  const DOCTOR_LIMIT = requestedDoctors; // Dynamic limit based on clinic's requested doctors

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
    contactNumber: "",
    experienceYears: "",
    consultationFee: "",
    introduction: "",
  });

  useEffect(() => {
    checkDoctorLimit();
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("specializations")
        .select("name")
        .eq("clinic_id", user.id)
        .order("name");

      if (error) throw error;
      setSpecializations(data?.map(s => s.name) || []);
    } catch (error: any) {
      console.error("Error fetching specializations:", error);
    }
  };

  const checkDoctorLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch clinic's requested doctor limit
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .select("requested_doctors")
        .eq("id", user.id)
        .single();

      if (clinicError) throw clinicError;
      
      const requestedLimit = clinicData.requested_doctors || 0;
      setRequestedDoctors(requestedLimit);

      // Count current doctors
      const { count, error } = await supabase
        .from("doctors")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", user.id);

      if (error) throw error;

      setCurrentCount(count || 0);
      setCanAddDoctor((count || 0) < requestedLimit);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCheckingLimit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddDoctor) {
      toast({
        title: "Doctor Limit Reached",
        description: `You've reached the maximum limit of ${requestedDoctors} doctors. Please contact support to increase your limit.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const user = session.user;

      // Store clinic owner's session
      const clinicSession = session;

      // Create auth user for the doctor
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create doctor account");

      // Create doctor profile
      const { error: doctorError } = await supabase.from("doctors").insert({
        id: authData.user.id,
        specialization: formData.specialization,
        qualification: "Medical Doctor", // Default value since qualification field is removed
        contact_number: formData.contactNumber,
        experience_years: formData.experienceYears ? parseInt(formData.experienceYears) : null,
        consultation_fee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        introduction: formData.introduction || null,
        clinic_id: user.id,
        approved: true, // Doctors are active by default
      });

      if (doctorError) throw doctorError;

      // Sign out the newly created doctor and restore clinic owner's session
      await supabase.auth.signOut();
      await supabase.auth.setSession({
        access_token: clinicSession.access_token,
        refresh_token: clinicSession.refresh_token,
      });

      toast({
        title: "✓ Doctor Added Successfully!",
        description: "The doctor has been registered and can now login immediately. You can view all doctors in the Doctors listing.",
      });

      navigate("/clinic/doctors");
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

  if (checkingLimit) {
    return (
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">Checking doctor limit...</p>
      </div>
    );
  }

  if (!canAddDoctor) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            You've reached your doctor limit ({currentCount}/{DOCTOR_LIMIT}). To add more doctors, please contact support and request a limit increase.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Limit Reached</CardTitle>
            <CardDescription>
              Your clinic is currently limited to {DOCTOR_LIMIT} doctors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/clinic/support")} className="w-full">
              Request Limit Increase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/clinic/dashboard")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Doctor</CardTitle>
          <CardDescription>
            Register a new doctor to your clinic ({currentCount}/{DOCTOR_LIMIT} used)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Dr. John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="doctor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-2">
                <SearchableSelect
                  value={formData.specialization}
                  onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                  options={specializations.map(spec => ({ value: spec, label: spec }))}
                  label="Specialization"
                  required
                  disabled={specializations.length === 0}
                  placeholder={specializations.length === 0 ? "Add specializations first" : "Select specialization"}
                  searchPlaceholder="Search specialization..."
                  emptyMessage="No specialization found."
                />
                {specializations.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Please <a href="/clinic/specializations" className="underline">add specializations</a> before adding a doctor.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceYears">Experience *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  required
                  placeholder="Years of experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationFee">Fee *</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  required
                  placeholder="PKR 2000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={formData.introduction}
                onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                rows={4}
                placeholder="Brief introduction about the doctor's expertise and background..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clinic/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding Doctor..." : "Add Doctor"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicAddDoctor;
