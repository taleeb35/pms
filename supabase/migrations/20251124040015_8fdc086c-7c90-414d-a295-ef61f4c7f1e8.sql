-- Allow doctors to update their own profile
CREATE POLICY "Doctors can update own profile"
ON public.doctors
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());