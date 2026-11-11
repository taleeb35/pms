-- Patient files bucket is private: documents are opened via signed URLs only.
-- SEO doctor photos now live in the public doctor-avatars bucket under seo/.
-- (Applied by hand on the self-hosted VPS on 2026-11-11, together with a one-off
--  rewrite of saved image links from the old Lovable host to app.zonoir.com.)
update storage.buckets set public = false where id = 'medical-documents';

create policy "Content writers can upload SEO doctor images to avatars" on storage.objects
  as permissive for insert to authenticated
  with check (bucket_id = 'doctor-avatars' and (storage.foldername(name))[1] = 'seo'
              and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'content_writer'::public.app_role));

create policy "Content writers can update SEO doctor images in avatars" on storage.objects
  as permissive for update to authenticated
  using (bucket_id = 'doctor-avatars' and (storage.foldername(name))[1] = 'seo'
         and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'content_writer'::public.app_role));
