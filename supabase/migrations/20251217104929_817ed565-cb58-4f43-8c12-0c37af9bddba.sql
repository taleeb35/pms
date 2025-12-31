-- Allow clinics to update their own receptionists (e.g., activate/draft)
ALTER TABLE public.clinic_receptionists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinics can update own receptionists" ON public.clinic_receptionists;
CREATE POLICY "Clinics can update own receptionists"
ON public.clinic_receptionists
FOR UPDATE
USING (clinic_id = auth.uid())
WITH CHECK (clinic_id = auth.uid());
