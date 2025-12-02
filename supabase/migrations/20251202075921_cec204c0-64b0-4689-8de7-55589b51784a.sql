-- Allow clinics to view their own doctors
CREATE POLICY "Clinics can view their own doctors"
ON public.doctors
FOR SELECT
USING (clinic_id = auth.uid());