-- Add clinic_id to disease, test, and report template tables for clinic-level sharing
ALTER TABLE public.doctor_disease_templates ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.doctor_test_templates ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.doctor_report_templates ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Drop existing policies for disease templates
DROP POLICY IF EXISTS "Doctors can view own disease templates" ON public.doctor_disease_templates;
DROP POLICY IF EXISTS "Doctors can insert own disease templates" ON public.doctor_disease_templates;
DROP POLICY IF EXISTS "Doctors can update own disease templates" ON public.doctor_disease_templates;
DROP POLICY IF EXISTS "Doctors can delete own disease templates" ON public.doctor_disease_templates;

-- New policies for disease templates (Doctors, Clinic Owners, Receptionists)
CREATE POLICY "Doctors can manage own disease templates" 
ON public.doctor_disease_templates FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Clinic owners can manage clinic disease templates" 
ON public.doctor_disease_templates FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Receptionists can manage clinic disease templates" 
ON public.doctor_disease_templates FOR ALL
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_disease_templates.clinic_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_disease_templates.clinic_id
));

-- Drop existing policies for test templates
DROP POLICY IF EXISTS "Doctors can view own test templates" ON public.doctor_test_templates;
DROP POLICY IF EXISTS "Doctors can insert own test templates" ON public.doctor_test_templates;
DROP POLICY IF EXISTS "Doctors can update own test templates" ON public.doctor_test_templates;
DROP POLICY IF EXISTS "Doctors can delete own test templates" ON public.doctor_test_templates;

-- New policies for test templates (Doctors, Clinic Owners, Receptionists)
CREATE POLICY "Doctors can manage own test templates" 
ON public.doctor_test_templates FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Clinic owners can manage clinic test templates" 
ON public.doctor_test_templates FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Receptionists can manage clinic test templates" 
ON public.doctor_test_templates FOR ALL
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_test_templates.clinic_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_test_templates.clinic_id
));

-- Drop existing policies for report templates
DROP POLICY IF EXISTS "Doctors can view own report templates" ON public.doctor_report_templates;
DROP POLICY IF EXISTS "Doctors can insert own report templates" ON public.doctor_report_templates;
DROP POLICY IF EXISTS "Doctors can update own report templates" ON public.doctor_report_templates;
DROP POLICY IF EXISTS "Doctors can delete own report templates" ON public.doctor_report_templates;

-- New policies for report templates (Doctors, Clinic Owners, Receptionists)
CREATE POLICY "Doctors can manage own report templates" 
ON public.doctor_report_templates FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Clinic owners can manage clinic report templates" 
ON public.doctor_report_templates FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Receptionists can manage clinic report templates" 
ON public.doctor_report_templates FOR ALL
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_report_templates.clinic_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  WHERE cr.user_id = auth.uid() 
  AND cr.clinic_id = doctor_report_templates.clinic_id
));