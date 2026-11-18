-- F7: patient insurance details and insurance claims per visit.
alter table public.patients add column if not exists insurance_provider text;
alter table public.patients add column if not exists insurance_policy_number text;
alter table public.patients add column if not exists insurance_valid_until date;

create table if not exists public.insurance_claims (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  insurer text not null check (length(trim(insurer)) between 1 and 200),
  policy_number text,
  claim_reference text,
  amount_claimed numeric not null default 0 check (amount_claimed >= 0),
  amount_approved numeric check (amount_approved is null or amount_approved >= 0),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'partly_approved', 'rejected', 'paid')),
  submitted_at date,
  decided_at date,
  notes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists insurance_claims_doctor_idx on public.insurance_claims (doctor_id, status, created_at desc);
create index if not exists insurance_claims_patient_idx on public.insurance_claims (patient_id);
create index if not exists insurance_claims_appointment_idx on public.insurance_claims (appointment_id);

alter table public.insurance_claims enable row level security;
drop policy if exists "Care team manages insurance claims" on public.insurance_claims;
create policy "Care team manages insurance claims" on public.insurance_claims
  for all to authenticated
  using (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok()))
  with check (public.can_work_for_doctor(doctor_id) and (select public.mfa_ok())
              and exists (select 1 from public.patients p where p.id = insurance_claims.patient_id));
grant select, insert, update, delete on public.insurance_claims to authenticated;
