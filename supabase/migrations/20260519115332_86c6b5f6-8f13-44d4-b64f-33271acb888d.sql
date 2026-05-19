
CREATE TABLE public.appointment_prescribed_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  brand TEXT,
  dosage TEXT,
  frequency TEXT,
  timing TEXT[] DEFAULT ARRAY[]::TEXT[],
  duration TEXT,
  duration_days INTEGER,
  meal TEXT,
  instructions TEXT,
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_apm_doctor ON public.appointment_prescribed_medicines(doctor_id);
CREATE INDEX idx_apm_patient ON public.appointment_prescribed_medicines(patient_id);
CREATE INDEX idx_apm_appointment ON public.appointment_prescribed_medicines(appointment_id);
CREATE INDEX idx_apm_doctor_name ON public.appointment_prescribed_medicines(doctor_id, lower(medicine_name));
CREATE INDEX idx_apm_prescribed_at ON public.appointment_prescribed_medicines(prescribed_at);

ALTER TABLE public.appointment_prescribed_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own prescribed medicines"
ON public.appointment_prescribed_medicines FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors insert own prescribed medicines"
ON public.appointment_prescribed_medicines FOR INSERT
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors update own prescribed medicines"
ON public.appointment_prescribed_medicines FOR UPDATE
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors delete own prescribed medicines"
ON public.appointment_prescribed_medicines FOR DELETE
USING (auth.uid() = doctor_id);

CREATE POLICY "Clinic can view prescribed medicines for their doctors"
ON public.appointment_prescribed_medicines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = appointment_prescribed_medicines.doctor_id
      AND d.clinic_id IS NOT NULL
      AND (
        d.clinic_id = auth.uid()
        OR public.is_receptionist_of_clinic(auth.uid(), d.clinic_id)
      )
  )
);

CREATE POLICY "Admins view all prescribed medicines"
ON public.appointment_prescribed_medicines FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_apm_updated_at
BEFORE UPDATE ON public.appointment_prescribed_medicines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
