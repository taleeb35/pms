import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileFormScreen from "@/components/mobile/MobileFormScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMobileRole } from "@/hooks/useMobileRole";
import { CitySelect } from "@/components/CitySelect";
import { format } from "date-fns";
import {
  validateName, validatePhone, validateEmail, validateCNIC,
  handleNameInput, handlePhoneInput, handleCNICInput,
} from "@/lib/validations";

const Field = ({ label, error, children, required }: any) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

const MobileWalkIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: userId, role } = useMobileRole();
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isGynecologist, setIsGynecologist] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    phone: "",
    email: "",
    cnic: "",
    date_of_birth: "",
    gender: "female" as "male" | "female" | "other",
    blood_group: "",
    city: "",
    address: "",
    allergies: "",
    major_diseases: "",
    pregnancy_start_date: "",
    appointment_time: format(new Date(), "HH:mm"),
    reason: "",
    doctor_id: "",
  });

  useEffect(() => {
    if (!userId || !role) return;
    if (role === "doctor") {
      setForm((f) => ({ ...f, doctor_id: userId }));
      supabase.from("doctors").select("specialization").eq("id", userId).maybeSingle()
        .then(({ data }) => setIsGynecologist(!!data?.specialization?.toLowerCase().includes("gynecologist")));
    } else {
      // clinic — load doctors for selection
      supabase.from("doctors").select("id, specialization, profiles:id(full_name)")
        .eq("clinic_id", userId).eq("approved", true)
        .then(({ data }) => setDoctors(data || []));
    }
  }, [userId, role]);

  const update = (k: string, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const errs: Record<string, string> = {};
    const nm = validateName(form.full_name);
    if (!nm.isValid) errs.full_name = nm.message;
    const ph = validatePhone(form.phone);
    if (!ph.isValid) errs.phone = ph.message;
    if (!form.date_of_birth) errs.date_of_birth = "Required";
    if (form.email) {
      const em = validateEmail(form.email, false);
      if (!em.isValid) errs.email = em.message;
    }
    if (form.cnic) {
      const cn = validateCNIC(form.cnic);
      if (!cn.isValid) errs.cnic = cn.message;
    }
    if (!form.appointment_time) errs.appointment_time = "Required";
    if (role === "clinic" && !form.doctor_id) errs.doctor_id = "Select doctor";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast({ title: "Please fix errors", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Generate patient_id
      const { data: existing } = await supabase
        .from("patients")
        .select("patient_id")
        .order("created_at", { ascending: false })
        .limit(1);
      const lastNum = existing?.[0]?.patient_id?.match(/\d+/)?.[0];
      const nextNum = lastNum ? parseInt(lastNum) + 1 : 1;
      const patient_id = `PAT${String(nextNum).padStart(5, "0")}`;

      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert({
          patient_id,
          full_name: form.full_name,
          father_name: form.father_name || null,
          phone: form.phone,
          email: form.email || null,
          cnic: form.cnic || null,
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          blood_group: form.blood_group || null,
          city: form.city || null,
          address: form.address || null,
          allergies: form.allergies || null,
          major_diseases: form.major_diseases || null,
          pregnancy_start_date: isGynecologist && form.pregnancy_start_date ? form.pregnancy_start_date : null,
          created_by: userId,
        })
        .select("id")
        .single();
      if (pErr) throw pErr;

      const { error: aErr } = await supabase.from("appointments").insert({
        patient_id: patient.id,
        doctor_id: form.doctor_id,
        appointment_date: format(new Date(), "yyyy-MM-dd"),
        appointment_time: form.appointment_time,
        appointment_type: "walk_in",
        status: "scheduled",
        reason: form.reason || null,
        created_by: userId,
      });
      if (aErr) throw aErr;

      toast({ title: "Walk-in registered" });
      navigate("/app/appointments");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileFormScreen
      title="Walk-in"
      subtitle="Register patient + today's visit"
      onSubmit={handleSubmit}
      submitLabel={submitting ? "Saving…" : "Register walk-in"}
      loading={submitting}
    >
      <Card className="p-3 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Patient details</p>

        <Field label="Full name" required error={errors.full_name}>
          <Input
            value={form.full_name}
            onChange={(e) => update("full_name", handleNameInput(e.target.value))}
            className="h-11 rounded-lg"
            placeholder="Patient name"
          />
        </Field>

        <Field label="Father / Guardian name">
          <Input value={form.father_name} onChange={(e) => update("father_name", handleNameInput(e.target.value))} className="h-11 rounded-lg" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" required error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", handlePhoneInput(e.target.value))}
              className="h-11 rounded-lg"
              placeholder="03001234567"
              inputMode="tel"
            />
          </Field>
          <Field label="Gender" required>
            <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
              <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth" required error={errors.date_of_birth}>
            <Input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
              className="h-11 rounded-lg"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </Field>
          <Field label="Blood group">
            <Select value={form.blood_group} onValueChange={(v) => update("blood_group", v)}>
              <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Email" error={errors.email}>
          <Input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className="h-11 rounded-lg" />
        </Field>

        <Field label="CNIC" error={errors.cnic}>
          <Input value={form.cnic} onChange={(e) => update("cnic", handleCNICInput(e.target.value))} className="h-11 rounded-lg" placeholder="35201-1234567-1" />
        </Field>

        <Field label="City">
          <CitySelect value={form.city} onValueChange={(v) => update("city", v)} />
        </Field>

        <Field label="Address">
          <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} className="rounded-lg" />
        </Field>

        <Field label="Allergies">
          <Input value={form.allergies} onChange={(e) => update("allergies", e.target.value)} className="h-11 rounded-lg" placeholder="e.g. Penicillin" />
        </Field>

        <Field label="Major diseases">
          <Input value={form.major_diseases} onChange={(e) => update("major_diseases", e.target.value)} className="h-11 rounded-lg" placeholder="e.g. Diabetes, Hypertension" />
        </Field>

        {isGynecologist && (
          <Field label="Last menstrual period (LMP)">
            <Input
              type="date"
              value={form.pregnancy_start_date}
              onChange={(e) => update("pregnancy_start_date", e.target.value)}
              className="h-11 rounded-lg"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </Field>
        )}
      </Card>

      <Card className="p-3 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Today's visit</p>

        {role === "clinic" && (
          <Field label="Doctor" required error={errors.doctor_id}>
            <Select value={form.doctor_id} onValueChange={(v) => update("doctor_id", v)}>
              <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.profiles?.full_name} {d.specialization && <span className="text-muted-foreground">· {d.specialization}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field label="Time" required error={errors.appointment_time}>
          <Input
            type="time"
            value={form.appointment_time}
            onChange={(e) => update("appointment_time", e.target.value)}
            className="h-11 rounded-lg"
          />
        </Field>

        <Field label="Reason for visit">
          <Textarea value={form.reason} onChange={(e) => update("reason", e.target.value)} rows={2} className="rounded-lg" placeholder="Symptoms or chief complaint" />
        </Field>
      </Card>
    </MobileFormScreen>
  );
};

export default MobileWalkIn;
