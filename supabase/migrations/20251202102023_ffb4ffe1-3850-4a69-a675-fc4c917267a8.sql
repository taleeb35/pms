-- Allow clinics to view their doctors' profiles
CREATE POLICY "Clinics can view their doctors' profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE doctors.id = profiles.id
      AND doctors.clinic_id = auth.uid()
  )
);