
-- Structured medicines for disease templates (clinic or doctor owned via parent)
CREATE TABLE public.doctor_disease_template_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.doctor_disease_templates(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  brand text,
  dosage text,
  frequency text,
  timing text[] NOT NULL DEFAULT '{}',
  duration text,
  meal text,
  instructions text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ddtm_template_id ON public.doctor_disease_template_medicines(template_id);

ALTER TABLE public.doctor_disease_template_medicines ENABLE ROW LEVEL SECURITY;

-- Inherit access from parent template (same rules as doctor_disease_templates)
CREATE POLICY "Doctors manage own template medicines"
ON public.doctor_disease_template_medicines
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_disease_templates t
    WHERE t.id = template_id AND t.doctor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_disease_templates t
    WHERE t.id = template_id AND t.doctor_id = auth.uid()
  )
);

CREATE POLICY "Clinic owners manage clinic template medicines"
ON public.doctor_disease_template_medicines
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_disease_templates t
    WHERE t.id = template_id AND t.clinic_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_disease_templates t
    WHERE t.id = template_id AND t.clinic_id = auth.uid()
  )
);

CREATE POLICY "Receptionists manage clinic template medicines"
ON public.doctor_disease_template_medicines
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.doctor_disease_templates t
    JOIN public.clinic_receptionists cr ON cr.clinic_id = t.clinic_id
    WHERE t.id = template_id
      AND cr.user_id = auth.uid()
      AND cr.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.doctor_disease_templates t
    JOIN public.clinic_receptionists cr ON cr.clinic_id = t.clinic_id
    WHERE t.id = template_id
      AND cr.user_id = auth.uid()
      AND cr.status = 'active'
  )
);

CREATE POLICY "Doctors view clinic template medicines"
ON public.doctor_disease_template_medicines
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.doctor_disease_templates t
    JOIN public.doctors d ON d.clinic_id = t.clinic_id
    WHERE t.id = template_id
      AND t.clinic_id IS NOT NULL
      AND d.id = auth.uid()
  )
);

CREATE TRIGGER trg_ddtm_updated_at
BEFORE UPDATE ON public.doctor_disease_template_medicines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
