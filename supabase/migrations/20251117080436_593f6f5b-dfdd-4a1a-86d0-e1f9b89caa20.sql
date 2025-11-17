-- Add delete policy for medical documents
CREATE POLICY "Medical staff can delete medical documents"
ON public.medical_documents
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'doctor'::app_role)
);