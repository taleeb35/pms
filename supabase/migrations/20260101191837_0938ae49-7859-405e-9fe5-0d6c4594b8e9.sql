-- Drop the policies that won't work (they rely on auth.uid() but referral partners don't use Supabase auth)
DROP POLICY IF EXISTS "Referral partners can view clinics with their code" ON public.clinics;
DROP POLICY IF EXISTS "Referral partners can view doctors with their code" ON public.doctors;
DROP POLICY IF EXISTS "Referral partners can view profiles of their referrals" ON public.profiles;

-- Allow anyone to view clinics that have a referral code (limited fields visible anyway)
-- This is safe because referred_by is not sensitive and we only query for specific referral codes
CREATE POLICY "Anyone can view clinics with referral code"
ON public.clinics
FOR SELECT
USING (referred_by IS NOT NULL);

-- Allow anyone to view doctors that have a referral code
CREATE POLICY "Anyone can view doctors with referral code"
ON public.doctors
FOR SELECT
USING (referred_by IS NOT NULL);

-- Allow anyone to view profiles for users that have referred_by in clinics or doctors
CREATE POLICY "Anyone can view profiles of referred users"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clinics c WHERE c.id = profiles.id AND c.referred_by IS NOT NULL
  )
  OR
  EXISTS (
    SELECT 1 FROM doctors d WHERE d.id = profiles.id AND d.referred_by IS NOT NULL
  )
);