-- Add storage policy for content writers to upload SEO doctor images
CREATE POLICY "Content writers can upload SEO doctor images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-documents' 
  AND (storage.filename(name) LIKE 'seo-doctor-%')
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'content_writer'::app_role
  )
);

-- Allow content writers to read their uploaded SEO images
CREATE POLICY "Content writers can view SEO doctor images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-documents' 
  AND (storage.filename(name) LIKE 'seo-doctor-%')
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'content_writer'::app_role
  )
);