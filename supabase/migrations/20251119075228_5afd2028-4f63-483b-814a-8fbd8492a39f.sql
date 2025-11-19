-- Allow doctors to create appointments
DROP POLICY IF EXISTS "Staff can create appointments" ON public.appointments;
CREATE POLICY "Staff can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'receptionist'::app_role)
  OR has_role(auth.uid(), 'doctor'::app_role)
);

-- Allow doctors to delete their own patients
DROP POLICY IF EXISTS "Admins can delete patients" ON public.patients;
CREATE POLICY "Staff can delete patients" 
ON public.patients 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'doctor'::app_role)
);