-- Allow clinics to view patients created by their doctors
CREATE POLICY "Clinics can view their doctors' patients"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = patients.created_by
    AND doctors.clinic_id = auth.uid()
  )
);