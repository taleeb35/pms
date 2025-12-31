-- Add policy to allow users to select referral partner records by email (for returning inserted row)
CREATE POLICY "Users can select own referral partner record by email"
ON public.referral_partners
FOR SELECT
USING (true);

-- Drop and recreate the trigger to ensure it runs BEFORE INSERT
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.referral_partners;

CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT ON public.referral_partners
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();