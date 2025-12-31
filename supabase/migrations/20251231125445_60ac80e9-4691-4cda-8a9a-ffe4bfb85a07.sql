-- Add INSERT policy for clinics to create schedules for their doctors
CREATE POLICY "Clinics can insert their doctors' schedules"
ON public.doctor_schedules
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM doctors d
  WHERE d.id = doctor_schedules.doctor_id
    AND d.clinic_id = auth.uid()
));

-- Add UPDATE policy for clinics to update schedules for their doctors
CREATE POLICY "Clinics can update their doctors' schedules"
ON public.doctor_schedules
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM doctors d
  WHERE d.id = doctor_schedules.doctor_id
    AND d.clinic_id = auth.uid()
));