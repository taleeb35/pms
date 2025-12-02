-- Add policy for clinics to insert patients for their doctors
CREATE POLICY "Clinics can insert patients for their doctors"
ON public.patients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.id = patients.created_by
    AND doctors.clinic_id = auth.uid()
  )
);

-- Add policy for clinics to update patients of their doctors
CREATE POLICY "Clinics can update their doctors' patients"
ON public.patients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM doctors
    WHERE doctors.id = patients.created_by
    AND doctors.clinic_id = auth.uid()
  )
);