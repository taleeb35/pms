-- Add RLS policy to allow admins to delete doctors
CREATE POLICY "Admins can delete doctors"
ON public.doctors
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));