-- Allow clinics to view their receptionists' profiles
CREATE POLICY "Clinics can view their receptionists profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    WHERE cr.user_id = profiles.id
    AND cr.clinic_id = auth.uid()
  )
);