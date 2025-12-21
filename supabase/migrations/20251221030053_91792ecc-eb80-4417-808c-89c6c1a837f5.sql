-- Allow public/unauthenticated users to view all specializations for doctor signup
CREATE POLICY "Anyone can view specializations for signup" 
ON public.specializations 
FOR SELECT 
USING (true);