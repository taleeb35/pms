-- Make the medical-documents bucket public for letterhead access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'medical-documents';