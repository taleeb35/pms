-- Allow public to view profiles of approved doctors for public doctor listings
CREATE POLICY "Anyone can view profiles of approved doctors"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = profiles.id AND d.approved = true
  )
);