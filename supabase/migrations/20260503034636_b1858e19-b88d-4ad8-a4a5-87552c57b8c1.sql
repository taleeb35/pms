
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-avatars', 'doctor-avatars', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Doctor avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-avatars');

CREATE POLICY "Authenticated users can upload their own doctor avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doctor-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own doctor avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'doctor-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own doctor avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'doctor-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
