-- Allow doctors to update their receptionists' profiles
CREATE POLICY "Doctors can update their receptionists profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = profiles.id
      AND dr.doctor_id = auth.uid()
  )
);

-- Allow doctors to view their receptionists' profiles
CREATE POLICY "Doctors can view their receptionists profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = profiles.id
      AND dr.doctor_id = auth.uid()
  )
);