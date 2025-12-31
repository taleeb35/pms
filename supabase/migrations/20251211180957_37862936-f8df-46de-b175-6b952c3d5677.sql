-- Add policy to allow clinics to update their doctors' profiles
CREATE POLICY "Clinics can update their doctors' profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM doctors
    WHERE doctors.id = profiles.id AND doctors.clinic_id = auth.uid()
  )
);

-- Also add policy to allow clinics to update their doctors' records in doctors table
CREATE POLICY "Clinics can update their own doctors"
ON public.doctors
FOR UPDATE
USING (clinic_id = auth.uid());