-- Allow doctor receptionists to read their own linkage row
CREATE POLICY "Doctor receptionists can view own record"
ON public.doctor_receptionists
FOR SELECT
USING (user_id = auth.uid());