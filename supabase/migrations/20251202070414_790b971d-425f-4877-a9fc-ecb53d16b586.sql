-- Drop the restrictive policy that only allows active clinics to view their profile
DROP POLICY IF EXISTS "Active clinics can view own profile" ON public.clinics;

-- Create new policy that allows all clinics to view their own profile (regardless of status)
-- This is needed so clinics can check their status during login
CREATE POLICY "Clinics can view own profile" 
ON public.clinics 
FOR SELECT 
USING (id = auth.uid());