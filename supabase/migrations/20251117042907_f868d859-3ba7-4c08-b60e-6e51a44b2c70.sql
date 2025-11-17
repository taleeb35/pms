-- Allow users to insert their own doctor record during signup
CREATE POLICY "Users can create own doctor profile"
ON public.doctors
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);