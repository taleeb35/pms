-- Allow clinics to insert receptionist roles for their receptionists
CREATE POLICY "Clinics can insert receptionist role for their receptionists"
ON public.user_roles
FOR INSERT
WITH CHECK (
  role = 'receptionist'::app_role 
  AND EXISTS (
    SELECT 1 FROM clinic_receptionists cr
    WHERE cr.user_id = user_roles.user_id
    AND cr.clinic_id = auth.uid()
  )
);

-- Update the clinic_receptionists insert policy to be more permissive during signup
-- The issue is that after signUp, auth.uid() becomes the new user, not the clinic owner
-- We need to handle this case by allowing the newly created user to be linked

DROP POLICY IF EXISTS "Clinics can insert own receptionists" ON public.clinic_receptionists;

-- Create a more flexible insert policy that works with the signup flow
CREATE POLICY "Clinics can insert own receptionists"
ON public.clinic_receptionists
FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT id FROM clinics WHERE id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'clinic'::app_role
    AND clinic_receptionists.clinic_id = auth.uid()
  )
);