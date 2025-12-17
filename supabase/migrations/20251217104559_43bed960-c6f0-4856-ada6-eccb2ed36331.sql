-- Allow clinics to update their receptionists' profiles
CREATE POLICY "Clinics can update their receptionists profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    WHERE cr.user_id = profiles.id AND cr.clinic_id = auth.uid()
  )
);