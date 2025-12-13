-- Allow users to view profiles of appointment creators within their clinic's appointments
CREATE POLICY "Clinics can view appointment creator profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.created_by = profiles.id
    AND d.clinic_id = auth.uid()
  )
);

-- Allow receptionists to view profiles of appointment creators within their clinic
CREATE POLICY "Receptionists can view appointment creator profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM clinic_receptionists cr
    JOIN doctors d ON d.clinic_id = cr.clinic_id
    JOIN appointments a ON a.doctor_id = d.id
    WHERE cr.user_id = auth.uid()
    AND a.created_by = profiles.id
  )
);