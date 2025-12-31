import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, UserPlus } from "lucide-react";
import { useDoctorReceptionistId } from "@/hooks/useDoctorReceptionistId";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { validateName, validatePhone, handleNameInput, handlePhoneInput } from "@/lib/validations";
import { PatientSearchSelect } from "@/components/PatientSearchSelect";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone: string;
}

const DoctorReceptionistWalkIn = () => {
  const { toast } = useToast();
  const { doctorId, loading: doctorLoading } = useDoctorReceptionistId();
  const [formLoading, setFormLoading] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    reason: "",
    consultationFee: "",
  });

  useEffect(() => {
    if (doctorId) {
      fetchPatients();
    }
  }, [doctorId]);

  const fetchPatients = async () => {
    if (!doctorId) return;
    
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_id, full_name, phone")
        .eq("created_by", doctorId)
        .order("full_name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
    }
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `P-${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;

    setFormLoading(true);

    try {
      let patientId = selectedPatientId;

      if (isNewPatient) {
        const nameValidation = validateName(formData.fullName);
        if (!nameValidation.isValid) {
          toast({ title: "Error", description: nameValidation.message, variant: "destructive" });
          setFormLoading(false);
          return;
        }

        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.isValid) {
          toast({ title: "Error", description: phoneValidation.message, variant: "destructive" });
          setFormLoading(false);
          return;
        }

        const { data: newPatient, error: patientError } = await supabase
          .from("patients")
          .insert({
            patient_id: generatePatientId(),
            full_name: formData.fullName,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth || "2000-01-01",
            gender: formData.gender as "male" | "female" | "other",
            created_by: doctorId,
          })
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      if (!patientId) {
        toast({ title: "Error", description: "Please select or create a patient", variant: "destructive" });
        setFormLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().slice(0, 5);

      const { error: apptError } = await supabase.from("appointments").insert({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: today,
        appointment_time: now,
        status: "in_progress",
        appointment_type: "walk-in",
        reason: formData.reason || "Walk-in",
        consultation_fee: parseFloat(formData.consultationFee) || 0,
        total_fee: parseFloat(formData.consultationFee) || 0,
      });

      if (apptError) throw apptError;

      toast({ title: "Success", description: "Walk-in patient registered successfully" });
      setFormData({ fullName: "", phone: "", dateOfBirth: "", gender: "male", reason: "", consultationFee: "" });
      setSelectedPatientId("");
      fetchPatients();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  if (doctorLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Walk-In Registration</h1>
        <p className="text-muted-foreground">Quick patient registration for walk-in visits</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Register Walk-In Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={isNewPatient ? "default" : "outline"}
                onClick={() => setIsNewPatient(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
              <Button
                type="button"
                variant={!isNewPatient ? "default" : "outline"}
                onClick={() => setIsNewPatient(false)}
              >
                Existing Patient
              </Button>
            </div>

            {isNewPatient ? (
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
                  <Label>Phone *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: handlePhoneInput(e) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
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
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <PatientSearchSelect
                  patients={patients}
                  value={selectedPatientId}
                  onValueChange={setSelectedPatientId}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reason for Visit</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="General checkup"
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation Fee (Rs.)</Label>
                <Input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <Button type="submit" disabled={formLoading} className="w-full">
              {formLoading ? "Registering..." : "Register Walk-In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorReceptionistWalkIn;