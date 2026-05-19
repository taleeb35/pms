
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  lead_date date NOT NULL DEFAULT CURRENT_DATE,
  comment text,
  status text NOT NULL DEFAULT 'active',
  source text NOT NULL DEFAULT 'manual',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_doctor ON public.leads(doctor_id);
CREATE INDEX idx_leads_clinic ON public.leads(clinic_id);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Doctor manages own leads
CREATE POLICY "Doctors manage own leads"
ON public.leads FOR ALL
TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- Clinic owners manage leads for doctors in their clinic
CREATE POLICY "Clinic owners manage clinic leads"
ON public.leads FOR ALL
TO authenticated
USING (clinic_id IS NOT NULL AND clinic_id = auth.uid())
WITH CHECK (clinic_id IS NOT NULL AND clinic_id = auth.uid());

-- Clinic receptionists manage leads for their clinic
CREATE POLICY "Clinic receptionists manage clinic leads"
ON public.leads FOR ALL
TO authenticated
USING (clinic_id IS NOT NULL AND public.is_receptionist_of_clinic(auth.uid(), clinic_id))
WITH CHECK (clinic_id IS NOT NULL AND public.is_receptionist_of_clinic(auth.uid(), clinic_id));

-- Doctor receptionists manage leads for their doctor
CREATE POLICY "Doctor receptionists manage doctor leads"
ON public.leads FOR ALL
TO authenticated
USING (public.is_doctor_receptionist(auth.uid(), doctor_id))
WITH CHECK (public.is_doctor_receptionist(auth.uid(), doctor_id));

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
