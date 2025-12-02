-- Add RLS policy to allow admins to delete clinics
CREATE POLICY "Admins can delete clinics"
ON public.clinics
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));