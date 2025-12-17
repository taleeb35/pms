-- Add RLS policies for clinics to manage procedures for their doctors
CREATE POLICY "Clinics can view their doctors procedures" 
ON public.procedures 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = procedures.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

CREATE POLICY "Clinics can insert procedures for their doctors" 
ON public.procedures 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = procedures.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

CREATE POLICY "Clinics can update their doctors procedures" 
ON public.procedures 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = procedures.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

CREATE POLICY "Clinics can delete their doctors procedures" 
ON public.procedures 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM doctors 
  WHERE doctors.id = procedures.doctor_id 
  AND doctors.clinic_id = auth.uid()
));

-- Add RLS policies for receptionists to manage procedures for their clinic's doctors
CREATE POLICY "Receptionists can insert clinic procedures" 
ON public.procedures 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = procedures.doctor_id
));

CREATE POLICY "Receptionists can update clinic procedures" 
ON public.procedures 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = procedures.doctor_id
));

CREATE POLICY "Receptionists can delete clinic procedures" 
ON public.procedures 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM clinic_receptionists cr
  JOIN doctors d ON d.clinic_id = cr.clinic_id
  WHERE cr.user_id = auth.uid() AND d.id = procedures.doctor_id
));