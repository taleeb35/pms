-- Allow referral partners to view clinics that were referred by their code
CREATE POLICY "Referral partners can view clinics with their code"
ON public.clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM referral_partners rp 
    WHERE rp.referral_code = clinics.referred_by 
    AND rp.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow referral partners to view doctors that were referred by their code
CREATE POLICY "Referral partners can view doctors with their code"
ON public.doctors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM referral_partners rp 
    WHERE rp.referral_code = doctors.referred_by 
    AND rp.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow referral partners to view profiles for referred clinics/doctors
CREATE POLICY "Referral partners can view profiles of their referrals"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM referral_partners rp
    JOIN clinics c ON c.referred_by = rp.referral_code
    WHERE c.id = profiles.id
    AND rp.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  OR
  EXISTS (
    SELECT 1 FROM referral_partners rp
    JOIN doctors d ON d.referred_by = rp.referral_code
    WHERE d.id = profiles.id
    AND rp.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);