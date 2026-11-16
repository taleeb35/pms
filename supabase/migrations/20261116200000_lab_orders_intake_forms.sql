-- C5 lab and imaging orders with results, D4 pre-visit intake forms with e-signed consent.

-- Who may work on a doctor's records: the doctor, their clinic, their active receptionists,
-- the clinic's receptionists, and admins.
create or replace function public.can_work_for_doctor(p_doctor uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select auth.uid() is not null and (
    auth.uid() = p_doctor
    or public.has_role(auth.uid(), 'admin'::app_role)
    or exists (select 1 from public.doctors d where d.id = p_doctor and d.clinic_id = auth.uid())
    or exists (select 1 from public.doctor_receptionists dr where dr.doctor_id = p_doctor and dr.user_id = auth.uid() and dr.status = 'active')
    or exists (select 1 from public.clinic_receptionists cr join public.doctors d on d.clinic_id = cr.clinic_id
               where d.id = p_doctor and cr.user_id = auth.uid())
  );
$$;
revoke all on function public.can_work_for_doctor(uuid) from public;
grant execute on function public.can_work_for_doctor(uuid) to authenticated;

-- ---------- Lab and imaging orders ----------
create table if not exists public.lab_orders (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  kind text not null default 'lab' check (kind in ('lab', 'imaging')),
  test_name text not null check (length(trim(test_name)) between 1 and 200),
  notes text,
  status text not null default 'ordered' check (status in ('ordered', 'done', 'cancelled')),
  result_value numeric,
  result_unit text,
  result_text text,
  result_file text,
  result_date date,
  ordered_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);
create index if not exists lab_orders_patient_idx on public.lab_orders (patient_id, ordered_at desc);
create index if not exists lab_orders_appointment_idx on public.lab_orders (appointment_id);
create index if not exists lab_orders_doctor_idx on public.lab_orders (doctor_id, status);

alter table public.lab_orders enable row level security;
drop policy if exists "Care team manages lab orders" on public.lab_orders;
create policy "Care team manages lab orders" on public.lab_orders
  for all to authenticated
  using (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok()))
  with check (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok())
              and exists (select 1 from public.patients p where p.id = lab_orders.patient_id));
grant select, insert, update, delete on public.lab_orders to authenticated;

-- ---------- Intake forms ----------
alter table public.doctors add column if not exists intake_consent_text text;

create table if not exists public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete cascade,
  status text not null default 'sent' check (status in ('sent', 'completed', 'cancelled')),
  consent_text text,
  answers jsonb,
  signed_name text,
  signature text,
  signed_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);
create index if not exists intake_forms_appointment_idx on public.intake_forms (appointment_id);
create index if not exists intake_forms_patient_idx on public.intake_forms (patient_id, created_at desc);

alter table public.intake_forms enable row level security;
drop policy if exists "Care team manages intake forms" on public.intake_forms;
create policy "Care team manages intake forms" on public.intake_forms
  for all to authenticated
  using (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok()))
  with check (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok())
              and exists (select 1 from public.patients p where p.id = intake_forms.patient_id));
grant select, insert, update, delete on public.intake_forms to authenticated;

-- Public: what the patient sees when opening the link. No medical data is returned.
create or replace function public.get_intake_form(p_token text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select jsonb_build_object(
      'found', true,
      'status', f.status,
      'expired', f.expires_at < now(),
      'patient', split_part(trim(p.full_name), ' ', 1),
      'doctor', pr.full_name,
      'clinic', cl.clinic_name,
      'appointment_date', a.appointment_date,
      'appointment_time', a.appointment_time,
      'consent_text', f.consent_text,
      'signed_at', f.signed_at
    )
    from public.intake_forms f
    join public.patients p on p.id = f.patient_id
    left join public.profiles pr on pr.id = f.doctor_id
    left join public.doctors d on d.id = f.doctor_id
    left join public.clinics cl on cl.id = d.clinic_id
    left join public.appointments a on a.id = f.appointment_id
    where f.token = p_token and length(p_token) = 64
  ), jsonb_build_object('found', false));
$$;
revoke all on function public.get_intake_form(text) from public;
grant execute on function public.get_intake_form(text) to anon, authenticated;

-- Public: the patient submits answers and signs. Works once, only before the link expires.
create or replace function public.submit_intake_form(p_token text, p_answers jsonb, p_signed_name text, p_signature text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  f public.intake_forms;
begin
  select * into f from public.intake_forms where token = p_token and length(p_token) = 64 for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if f.status <> 'sent' then return jsonb_build_object('ok', false, 'error', 'already_done'); end if;
  if f.expires_at < now() then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or length(p_answers::text) > 20000 then
    return jsonb_build_object('ok', false, 'error', 'bad_answers');
  end if;
  if length(trim(coalesce(p_signed_name, ''))) < 2 or length(p_signed_name) > 120 then
    return jsonb_build_object('ok', false, 'error', 'name_required');
  end if;
  if p_signature is not null and (length(p_signature) > 300000 or p_signature not like 'data:image/png;base64,%') then
    return jsonb_build_object('ok', false, 'error', 'bad_signature');
  end if;

  update public.intake_forms
     set status = 'completed', answers = p_answers, signed_name = trim(p_signed_name),
         signature = p_signature, signed_at = now()
   where id = f.id;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.submit_intake_form(text, jsonb, text, text) from public;
grant execute on function public.submit_intake_form(text, jsonb, text, text) to anon, authenticated;
