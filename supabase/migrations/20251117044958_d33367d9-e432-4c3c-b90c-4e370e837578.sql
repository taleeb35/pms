-- Allow users to insert their own doctor role during signup
CREATE POLICY "Users can insert own doctor role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'doctor'
);