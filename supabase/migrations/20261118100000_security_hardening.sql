-- Security review 18 Nov 2026.

-- 1. Calendar links move out of the doctors table, which visitors can read.
create table if not exists public.doctor_calendar_links (
  doctor_id uuid primary key references public.doctors(id) on delete cascade,
  token text not null unique check (length(token) >= 40),
  created_at timestamptz not null default now()
);
alter table public.doctor_calendar_links enable row level security;
drop policy if exists "Doctor manages own calendar link" on public.doctor_calendar_links;
create policy "Doctor manages own calendar link" on public.doctor_calendar_links
  for all to authenticated
  using (doctor_id = auth.uid() and (select public.mfa_ok()))
  with check (doctor_id = auth.uid() and (select public.mfa_ok()));
revoke all on public.doctor_calendar_links from anon;
grant select, insert, update, delete on public.doctor_calendar_links to authenticated;
insert into public.doctor_calendar_links (doctor_id, token)
  select id, calendar_token from public.doctors where calendar_token is not null
  on conflict (doctor_id) do nothing;
alter table public.doctors drop column if exists calendar_token;

-- 2. Visitors (not signed in) may read only the public profile fields of approved doctors.
revoke select on public.doctors from anon;
grant select (id, approved, specialization, qualification, city, experience_years, introduction, consultation_fee,
  contact_number, facebook_url, instagram_url, youtube_url, tiktok_url, clinic_address, clinic_map_location, clinic_id,
  available_days, available_hours, country_code, created_at, updated_at) on public.doctors to anon;

-- 3. Helper functions visitors never need.
revoke execute on function public.generate_inventory_invoice_number(uuid) from anon, public;
revoke execute on function public.generate_inventory_po_number(uuid) from anon, public;
revoke execute on function public.generate_inventory_return_number(uuid) from anon, public;
revoke execute on function public.generate_membership_card_number(uuid) from anon, public;
revoke execute on function public.clinic_required_paid_month(uuid) from anon, public;
revoke execute on function public.get_active_patient_membership(uuid) from anon, public;
grant execute on function public.generate_inventory_invoice_number(uuid), public.generate_inventory_po_number(uuid),
  public.generate_inventory_return_number(uuid), public.generate_membership_card_number(uuid),
  public.clinic_required_paid_month(uuid), public.get_active_patient_membership(uuid) to authenticated;

-- Membership lookup only for staff who work with the patient's doctor (or the clinic that runs the plan).
create or replace function public.get_active_patient_membership(_patient_id uuid)
returns table(membership_id uuid, clinic_id uuid, plan_id uuid, plan_name text, card_number text, start_date date, end_date date,
  color text, consultation_discount_pct numeric, procedure_discount_pct numeric, pharmacy_discount_pct numeric)
language sql
stable
security definer
set search_path to 'public'
as $$
  select pm.id, pm.clinic_id, p.id, p.name, pm.card_number, pm.start_date, pm.end_date, p.color,
         p.consultation_discount_pct, p.procedure_discount_pct, p.pharmacy_discount_pct
  from public.patient_memberships pm
  join public.clinic_membership_plans p on p.id = pm.plan_id
  where pm.patient_id = _patient_id and pm.status = 'active' and pm.end_date >= current_date
    and (public.can_manage_clinic_inventory(pm.clinic_id)
         or exists (select 1 from public.patients pt where pt.id = _patient_id and public.can_work_for_doctor(pt.created_by)))
  order by pm.created_at desc
  limit 1;
$$;

-- 4. Public booking form: stop floods. At most 3 online bookings per phone number per day,
--    and 40 online bookings per doctor per day.
create or replace function public.limit_public_bookings()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  ph text;
  n int;
begin
  if coalesce(new.source, '') <> 'public_profile' then return new; end if;
  select regexp_replace(coalesce(phone, ''), '\D', '', 'g') into ph from public.patients where id = new.patient_id;
  select count(*) into n from public.appointments a join public.patients p on p.id = a.patient_id
   where a.source = 'public_profile' and a.created_at > now() - interval '24 hours'
     and regexp_replace(coalesce(p.phone, ''), '\D', '', 'g') = ph and ph <> '';
  if n >= 3 then raise exception 'Too many online bookings from this phone number today. Please call the clinic.'; end if;
  select count(*) into n from public.appointments a
   where a.source = 'public_profile' and a.doctor_id = new.doctor_id and a.created_at > now() - interval '24 hours';
  if n >= 40 then raise exception 'Online booking is busy for this doctor today. Please call the clinic.'; end if;
  return new;
end;
$$;
drop trigger if exists trg_limit_public_bookings on public.appointments;
create trigger trg_limit_public_bookings before insert on public.appointments
  for each row execute function public.limit_public_bookings();

-- 5. Patient files: only the patient's own doctor, that doctor's receptionists, the clinic's receptionists
--    and admins. (Clinic owner accounts keep no access, as decided on 11 Nov.) Before, any doctor account
--    could list and open every patient's files.
create or replace function public.can_access_patient_file(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  f text := split_part(coalesce(p_name, ''), '/', 1);
  doc uuid;
begin
  if auth.uid() is null then return false; end if;
  if public.has_role(auth.uid(), 'admin'::app_role) then return true; end if;
  if f !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  select created_by into doc from public.patients where id = f::uuid;
  if doc is null then return false; end if;
  return auth.uid() = doc
      or exists (select 1 from public.doctor_receptionists dr where dr.doctor_id = doc and dr.user_id = auth.uid() and dr.status = 'active')
      or exists (select 1 from public.clinic_receptionists cr join public.doctors d on d.clinic_id = cr.clinic_id
                 where d.id = doc and cr.user_id = auth.uid());
end;
$$;
revoke all on function public.can_access_patient_file(text) from public, anon;
grant execute on function public.can_access_patient_file(text) to authenticated;

drop policy if exists "Medical staff can view documents" on storage.objects;
drop policy if exists "Medical staff can upload documents" on storage.objects;
drop policy if exists "Medical staff can delete documents" on storage.objects;
create policy "Care team can view patient files" on storage.objects for select to authenticated
  using (bucket_id = 'medical-documents' and public.can_access_patient_file(name));
create policy "Care team can upload patient files" on storage.objects for insert to authenticated
  with check (bucket_id = 'medical-documents' and public.can_access_patient_file(name));
create policy "Care team can update patient files" on storage.objects for update to authenticated
  using (bucket_id = 'medical-documents' and public.can_access_patient_file(name));
create policy "Doctors and admins can delete patient files" on storage.objects for delete to authenticated
  using (bucket_id = 'medical-documents' and public.can_access_patient_file(name)
         and (public.has_role(auth.uid(), 'doctor'::app_role) or public.has_role(auth.uid(), 'admin'::app_role)));

-- Blog images: only admins and content writers may change them (before: any signed-in user).
drop policy if exists "Authenticated users can upload blog images" on storage.objects;
drop policy if exists "Authenticated users can update blog images" on storage.objects;
drop policy if exists "Authenticated users can delete blog images" on storage.objects;
create policy "Writers can upload blog images" on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images' and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'content_writer'::app_role)));
create policy "Writers can update blog images" on storage.objects for update to authenticated
  using (bucket_id = 'blog-images' and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'content_writer'::app_role)));
create policy "Writers can delete blog images" on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images' and (public.has_role(auth.uid(), 'admin'::app_role) or public.has_role(auth.uid(), 'content_writer'::app_role)));

-- File type and size limits, so nobody can host web pages or huge files on app.zonoir.com.
update storage.buckets set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'], file_size_limit = 5242880
 where id in ('blog-images', 'doctor-avatars');
update storage.buckets set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain'], file_size_limit = 20971520
 where id = 'medical-documents';
