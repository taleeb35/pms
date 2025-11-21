-- Create policies for doctors to upload their own letterheads
CREATE POLICY "Doctors can upload letterheads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = 'letterheads'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Doctors can update letterheads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = 'letterheads'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Doctors can read letterheads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = 'letterheads'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Doctors can delete letterheads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.foldername(name))[1] = 'letterheads'
  AND auth.uid()::text = (storage.foldername(name))[2]
);