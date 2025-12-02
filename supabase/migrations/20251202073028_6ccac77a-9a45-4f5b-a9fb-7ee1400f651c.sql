-- Allow clinics to read system settings
CREATE POLICY "Clinics can view system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'clinic'::app_role));