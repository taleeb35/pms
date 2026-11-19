-- Security: signed-in doctors and clinics could change their own billing and approval fields
-- (extend the free trial, mark themselves approved / active / paid, raise their doctor limit, join
-- another clinic). Only admins and the server (service role, cron, SQL) may change these now.

create or replace function public.is_privileged_writer()
returns boolean language sql stable security definer set search_path = public as $$
  -- No signed-in user = service role, cron job or direct SQL.
  select auth.uid() is null or public.has_role(auth.uid(), 'admin'::app_role);
$$;
revoke execute on function public.is_privileged_writer() from anon, public;
grant execute on function public.is_privileged_writer() to authenticated;

create or replace function public.guard_doctor_billing_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_privileged_writer() then return new; end if;

  if tg_op = 'INSERT' then
    -- Self sign-up: always a fresh 14-day trial; a doctor can only be put in a clinic by that clinic.
    new.trial_end_date := (current_date + 14);
    if new.clinic_id is not null and new.clinic_id <> auth.uid() then
      raise exception 'Doctors can only be added to a clinic by that clinic.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.trial_end_date is distinct from old.trial_end_date
     or new.clinic_id is distinct from old.clinic_id
     or new.payment_plan is distinct from old.payment_plan
     or new.referred_by is distinct from old.referred_by then
    raise exception 'Only Zonoir can change trial, clinic, plan or referral details.' using errcode = '42501';
  end if;
  -- Approval and the clinic's share are set by the doctor's clinic (or admin), never by the doctor.
  if (new.approved is distinct from old.approved or new.clinic_percentage is distinct from old.clinic_percentage)
     and (old.clinic_id is null or old.clinic_id <> auth.uid()) then
    raise exception 'Only the clinic or Zonoir can change approval or clinic share.' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists guard_doctor_billing_fields on public.doctors;
create trigger guard_doctor_billing_fields before insert or update on public.doctors
  for each row execute function public.guard_doctor_billing_fields();

create or replace function public.guard_clinic_billing_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_privileged_writer() then return new; end if;

  if tg_op = 'INSERT' then
    new.trial_end_date := (current_date + 14);
    new.fee_status := 'unpaid';
    new.billing_cycle_day := null;
    new.billable_doctors := null;
    if new.status not in ('active', 'draft') then new.status := 'draft'; end if;
    return new;
  end if;

  if new.trial_end_date is distinct from old.trial_end_date
     or new.status is distinct from old.status
     or new.fee_status is distinct from old.fee_status
     or new.requested_doctors is distinct from old.requested_doctors
     or new.billable_doctors is distinct from old.billable_doctors
     or new.billing_cycle_day is distinct from old.billing_cycle_day
     or new.payment_plan is distinct from old.payment_plan
     or new.referred_by is distinct from old.referred_by then
    raise exception 'Only Zonoir can change trial, status, payment or doctor-limit details.' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists guard_clinic_billing_fields on public.clinics;
create trigger guard_clinic_billing_fields before insert or update on public.clinics
  for each row execute function public.guard_clinic_billing_fields();

-- Creating a doctor row: only for yourself (sign-up). Clinics add doctors through the
-- clinic-add-doctor server function, which uses the service role.
drop policy if exists "Users can create own doctor profile" on public.doctors;
create policy "Users can create own doctor profile" on public.doctors for insert to authenticated
  with check (auth.uid() = id);

-- Visitors could list every file name in the public picture folders (names include account IDs).
-- Pictures still load for everyone through their public links; only listing needs a login now.
drop policy if exists "Doctor avatars are publicly viewable" on storage.objects;
create policy "Doctor avatars are publicly viewable" on storage.objects for select to authenticated
  using (bucket_id = 'doctor-avatars');
drop policy if exists "Blog images are publicly accessible" on storage.objects;
create policy "Blog images are publicly accessible" on storage.objects for select to authenticated
  using (bucket_id = 'blog-images');
