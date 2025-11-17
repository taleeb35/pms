-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow medical staff to view documents
CREATE POLICY "Medical staff can view documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medical-documents' AND
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'doctor'::app_role) OR 
   has_role(auth.uid(), 'nurse'::app_role) OR 
   has_role(auth.uid(), 'receptionist'::app_role))
);

-- Allow medical staff to upload documents
CREATE POLICY "Medical staff can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'medical-documents' AND
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'doctor'::app_role) OR 
   has_role(auth.uid(), 'nurse'::app_role) OR 
   has_role(auth.uid(), 'receptionist'::app_role))
);

-- Allow medical staff to delete documents
CREATE POLICY "Medical staff can delete documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'medical-documents' AND
  (has_role(auth.uid(), 'admin'::app_role) OR 
   has_role(auth.uid(), 'doctor'::app_role))
);