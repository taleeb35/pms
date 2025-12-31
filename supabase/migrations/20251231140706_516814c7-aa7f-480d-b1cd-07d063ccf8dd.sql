-- Allow doctors to insert receptionist role for their receptionists
CREATE POLICY "Doctors can insert receptionist role for their receptionists"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'receptionist'::app_role
  AND has_role(auth.uid(), 'doctor'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.doctor_receptionists dr
    WHERE dr.user_id = user_roles.user_id
      AND dr.doctor_id = auth.uid()
  )
);