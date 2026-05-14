import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, Mail, Calendar, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AIPatientInsights from "@/components/AIPatientInsights";
import { Sparkles, Printer } from "lucide-react";
import { useActiveMembership } from "@/hooks/useActiveMembership";
import { useClinicId } from "@/hooks/useClinicId";
import EnrollMembershipDialog from "@/components/memberships/EnrollMembershipDialog";
import MembershipCardPrint from "@/components/memberships/MembershipCardPrint";
import { useState as useStateHook } from "react";
import { format, differenceInDays } from "date-fns";

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  cnic: string | null;
  gender: string;
  date_of_birth: string;
  blood_group: string | null;
  city: string | null;
  address: string | null;
  father_name: string | null;
  marital_status: string | null;
  allergies: string | null;
  major_diseases: string | null;
  medical_history: string | null;
  created_by: string | null;
}

const ClinicPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { clinicId } = useClinicId();
  const { membership, refetch: refetchMembership } = useActiveMembership(id ?? null);
  const [enrollOpen, setEnrollOpen] = useStateHook(false);
  const [cardOpen, setCardOpen] = useStateHook(false);
  const [clinicName, setClinicName] = useStateHook("Clinic");

  useEffect(() => {
    if (clinicId) {
      supabase.from("clinics").select("clinic_name").eq("id", clinicId).maybeSingle()
        .then(({ data }) => data && setClinicName((data as any).clinic_name));
    }
  }, [clinicId]);

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPatient(data);
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

  if (loading) {
    return <div className="text-center py-8">Loading patient details...</div>;
  }

  if (!patient) {
    return <div className="text-center py-8">Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/clinic/patients")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Button>

      <AIPatientInsights patientId={patient.id} patientName={patient.full_name} />

      {/* Membership status */}
      {membership ? (
        <Card className="border-l-4" style={{ borderLeftColor: membership.color }}>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{ background: membership.color }}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{membership.plan_name} Member</div>
                <div className="text-xs text-muted-foreground">
                  Card <span className="font-mono">{membership.card_number}</span> · Expires {format(new Date(membership.end_date), "dd MMM yyyy")}
                  {differenceInDays(new Date(membership.end_date), new Date()) <= 30 && (
                    <span className="text-amber-600 font-medium"> · expires soon</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCardOpen(true)}>
                <Printer className="h-4 w-4 mr-1" />View Card
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEnrollOpen(true)}>Renew / Change Plan</Button>
            </div>
          </CardContent>
        </Card>
      ) : clinicId && (
        <Card className="border-dashed">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium">No active membership</div>
                <div className="text-xs text-muted-foreground">Enroll this patient to apply automatic discounts.</div>
              </div>
            </div>
            <Button size="sm" onClick={() => setEnrollOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />Enroll in Membership
            </Button>
          </CardContent>
        </Card>
      )}

      {clinicId && (
        <EnrollMembershipDialog
          open={enrollOpen}
          onOpenChange={setEnrollOpen}
          clinicId={clinicId}
          fixedPatient={{ id: patient.id, full_name: patient.full_name, phone: patient.phone, patient_id: patient.patient_id }}
          onEnrolled={refetchMembership}
        />
      )}
      {membership && (
        <MembershipCardPrint
          open={cardOpen}
          onOpenChange={setCardOpen}
          clinicName={clinicName}
          patientName={patient.full_name}
          cardNumber={membership.card_number}
          planName={membership.plan_name}
          color={membership.color}
          startDate={membership.start_date}
          endDate={membership.end_date}
          status="active"
          discounts={{
            consultation: membership.consultation_discount_pct,
            procedure: membership.procedure_discount_pct,
            pharmacy: membership.pharmacy_discount_pct,
          }}
        />
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{patient.full_name}</CardTitle>
                  <p className="text-muted-foreground">ID: {patient.patient_id}</p>
                </div>
              </div>
              {patient.date_of_birth && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  {calculateAge(patient.date_of_birth)} years old
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="medical">Medical Information</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                    <p className="font-medium">{patient.phone}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{patient.email || "Not provided"}</p>
                  </div>

                  {patient.cnic && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">CNIC</p>
                      <p className="font-medium">{patient.cnic}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Date of Birth</span>
                    </div>
                    <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Gender</span>
                    </div>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>Blood Group</span>
                    </div>
                    <p className="font-medium">{patient.blood_group || "Not provided"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{patient.city || "Not provided"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-medium">{patient.father_name || "Not provided"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium capitalize">{patient.marital_status || "Not provided"}</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.address || "Not provided"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Allergies</p>
                    <p className="font-medium">{patient.allergies || "No known allergies"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Major Diseases</p>
                    <p className="font-medium">{patient.major_diseases || "None reported"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Medical History</p>
                    <p className="font-medium">{patient.medical_history || "No medical history recorded"}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicPatientDetail;
