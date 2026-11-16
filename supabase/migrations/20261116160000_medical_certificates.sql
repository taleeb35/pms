-- Sick-leave, work-leave and fitness certificates issued from a visit.
-- Each has a short code printed as a QR; anyone can check the code at /verify/<code>
-- and sees only: valid or cancelled, type, dates, the patient's first name and initial, and the doctor.
create table if not exists public.medical_certificates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  cert_type text not null check (cert_type in ('sick_leave', 'work_leave', 'fitness', 'other')),
  title text not null,
  body text not null,
  start_date date,
  end_date date,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_by uuid default auth.uid()
);
create index if not exists medical_certificates_doctor_idx on public.medical_certificates (doctor_id, issued_at desc);
create index if not exists medical_certificates_patient_idx on public.medical_certificates (patient_id);

alter table public.medical_certificates enable row level security;

drop policy if exists "Doctors manage own certificates" on public.medical_certificates;
create policy "Doctors manage own certificates" on public.medical_certificates
  for all to authenticated
  using (doctor_id = auth.uid() and (select public.mfa_ok()))
  with check (doctor_id = auth.uid() and (select public.mfa_ok())
              and exists (select 1 from public.patients p where p.id = medical_certificates.patient_id and p.created_by = auth.uid()));

drop policy if exists "Clinics read their doctors' certificates" on public.medical_certificates;
create policy "Clinics read their doctors' certificates" on public.medical_certificates
  for select to authenticated
  using (exists (select 1 from public.doctors d where d.id = medical_certificates.doctor_id and d.clinic_id = auth.uid()) and (select public.mfa_ok()));

drop policy if exists "Admins read certificates" on public.medical_certificates;
create policy "Admins read certificates" on public.medical_certificates
  for select to authenticated using (public.has_role(auth.uid(), 'admin'::app_role));

grant select, insert, update on public.medical_certificates to authenticated;

-- Public check of a certificate code. Returns as little as possible.
create or replace function public.verify_certificate(p_code text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select jsonb_build_object(
      'found', true,
      'valid', c.revoked_at is null,
      'title', c.title,
      'cert_type', c.cert_type,
      'start_date', c.start_date,
      'end_date', c.end_date,
      'issued_at', c.issued_at,
      'patient', split_part(trim(p.full_name), ' ', 1) ||
                 case when position(' ' in trim(p.full_name)) > 0
                      then ' ' || upper(left(regexp_replace(trim(p.full_name), '^.* ', ''), 1)) || '.' else '' end,
      'doctor', pr.full_name,
      'clinic', cl.clinic_name
    )
    from public.medical_certificates c
    join public.patients p on p.id = c.patient_id
    left join public.profiles pr on pr.id = c.doctor_id
    left join public.doctors d on d.id = c.doctor_id
    left join public.clinics cl on cl.id = d.clinic_id
    where c.code = upper(trim(p_code))
  ), jsonb_build_object('found', false));
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;
