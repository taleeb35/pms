-- Drop existing policies for template tables
DROP POLICY IF EXISTS "Doctors can manage own disease templates" ON public.doctor_disease_templates;
DROP POLICY IF EXISTS "Clinic owners can manage clinic disease templates" ON public.doctor_disease_templates;
DROP POLICY IF EXISTS "Receptionists can manage clinic disease templates" ON public.doctor_disease_templates;

DROP POLICY IF EXISTS "Doctors can manage own test templates" ON public.doctor_test_templates;
DROP POLICY IF EXISTS "Clinic owners can manage clinic test templates" ON public.doctor_test_templates;
DROP POLICY IF EXISTS "Receptionists can manage clinic test templates" ON public.doctor_test_templates;

DROP POLICY IF EXISTS "Doctors can manage own report templates" ON public.doctor_report_templates;
DROP POLICY IF EXISTS "Clinic owners can manage clinic report templates" ON public.doctor_report_templates;
DROP POLICY IF EXISTS "Receptionists can manage clinic report templates" ON public.doctor_report_templates;

-- DISEASE TEMPLATES POLICIES

-- Doctors can manage their own templates (doctor_id = auth.uid())
CREATE POLICY "Doctors can manage own disease templates"
ON public.doctor_disease_templates
FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- Doctors can VIEW clinic-level templates (templates created by clinic/receptionist for their clinic)
CREATE POLICY "Doctors can view clinic disease templates"
ON public.doctor_disease_templates
FOR SELECT
USING (
  clinic_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.doctors d 
    WHERE d.id = auth.uid() 
    AND d.clinic_id = doctor_disease_templates.clinic_id
  )
);

-- Clinic owners can manage clinic templates
CREATE POLICY "Clinic owners can manage clinic disease templates"
ON public.doctor_disease_templates
FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

-- Receptionists can manage clinic templates
CREATE POLICY "Receptionists can manage clinic disease templates"
ON public.doctor_disease_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_disease_templates.clinic_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_disease_templates.clinic_id
  )
);

-- TEST TEMPLATES POLICIES

-- Doctors can manage their own templates
CREATE POLICY "Doctors can manage own test templates"
ON public.doctor_test_templates
FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- Doctors can VIEW clinic-level templates
CREATE POLICY "Doctors can view clinic test templates"
ON public.doctor_test_templates
FOR SELECT
USING (
  clinic_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.doctors d 
    WHERE d.id = auth.uid() 
    AND d.clinic_id = doctor_test_templates.clinic_id
  )
);

-- Clinic owners can manage clinic templates
CREATE POLICY "Clinic owners can manage clinic test templates"
ON public.doctor_test_templates
FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

-- Receptionists can manage clinic templates
CREATE POLICY "Receptionists can manage clinic test templates"
ON public.doctor_test_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_test_templates.clinic_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_test_templates.clinic_id
  )
);

-- REPORT TEMPLATES POLICIES

-- Doctors can manage their own templates
CREATE POLICY "Doctors can manage own report templates"
ON public.doctor_report_templates
FOR ALL
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- Doctors can VIEW clinic-level templates
CREATE POLICY "Doctors can view clinic report templates"
ON public.doctor_report_templates
FOR SELECT
USING (
  clinic_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.doctors d 
    WHERE d.id = auth.uid() 
    AND d.clinic_id = doctor_report_templates.clinic_id
  )
);

-- Clinic owners can manage clinic templates
CREATE POLICY "Clinic owners can manage clinic report templates"
ON public.doctor_report_templates
FOR ALL
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());

-- Receptionists can manage clinic templates
CREATE POLICY "Receptionists can manage clinic report templates"
ON public.doctor_report_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_report_templates.clinic_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clinic_receptionists cr
    WHERE cr.user_id = auth.uid() 
    AND cr.clinic_id = doctor_report_templates.clinic_id
  )
);