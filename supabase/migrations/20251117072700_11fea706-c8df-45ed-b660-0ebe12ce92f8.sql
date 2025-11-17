-- Drop the existing insert policy for patients
DROP POLICY IF EXISTS "Staff can insert patients" ON public.patients;

-- Create new insert policy that includes doctors
CREATE POLICY "Staff can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);