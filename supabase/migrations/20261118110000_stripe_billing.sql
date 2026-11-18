-- Stripe subscription billing (USD 35 per doctor per month, 14-day trial without card).
-- Billing owner = the clinic (clinics.id) or, for a doctor without a clinic, the doctor (doctors.id).
-- When an owner is not exempt and has no active subscription after the trial, its accounts become
-- read-only: restrictive RLS policies block insert/update/delete for signed-in users.

-- Server-only secrets (Stripe keys). No policies: only the service role can read or write.
create table if not exists public.app_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

create table if not exists public.billing_accounts (
  owner_id uuid primary key,
  kind text not null check (kind in ('clinic', 'doctor')),
  exempt boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'none',
  quantity integer,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
create unique index if not exists billing_accounts_sub_idx on public.billing_accounts (stripe_subscription_id) where stripe_subscription_id is not null;
create unique index if not exists billing_accounts_cus_idx on public.billing_accounts (stripe_customer_id) where stripe_customer_id is not null;
alter table public.billing_accounts enable row level security;
revoke all on public.billing_accounts from anon;
grant select on public.billing_accounts to authenticated;
grant update (exempt) on public.billing_accounts to authenticated;

drop policy if exists "Owner reads own billing" on public.billing_accounts;
create policy "Owner reads own billing" on public.billing_accounts for select to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Admin sets exempt" on public.billing_accounts;
create policy "Admin sets exempt" on public.billing_accounts for update to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role))
  with check (public.has_role(auth.uid(), 'admin'::app_role));

-- Everyone billed before Stripe keeps the current (manual) rules until the admin switches them.
insert into public.billing_accounts (owner_id, kind, exempt)
select id, 'clinic', true from public.clinics
on conflict (owner_id) do nothing;
insert into public.billing_accounts (owner_id, kind, exempt)
select id, 'doctor', true from public.doctors where clinic_id is null
on conflict (owner_id) do nothing;

-- Billing owner for a doctor.
create or replace function public.billing_owner_of_doctor(_doctor uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce((select clinic_id from public.doctors where id = _doctor), _doctor);
$$;

-- Trial end for an owner: the stored trial date, or 14 days after sign-up when it was cleared.
create or replace function public.billing_trial_end(_owner uuid)
returns date language sql stable security definer set search_path = public as $$
  select coalesce(
    (select coalesce(trial_end_date, (created_at::date + 14)) from public.clinics where id = _owner),
    (select coalesce(trial_end_date, (created_at::date + 14)) from public.doctors where id = _owner and clinic_id is null)
  );
$$;

-- Can this billing owner's accounts change data?
create or replace function public.billing_owner_can_write(_owner uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare b record; t date;
begin
  if _owner is null then return true; end if;
  select exempt, status into b from public.billing_accounts where owner_id = _owner;
  if found and b.exempt then return true; end if;
  if found and b.status in ('active', 'trialing') then return true; end if;
  t := public.billing_trial_end(_owner);
  if t is null then return true; end if;          -- not a clinic or independent doctor
  return current_date <= t;
end $$;

-- Used by the restrictive policies. Admins are never blocked.
create or replace function public.billing_write_ok(_doctor uuid, _clinic uuid default null)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when public.has_role(auth.uid(), 'admin'::app_role) then true
    when _doctor is not null then public.billing_owner_can_write(public.billing_owner_of_doctor(_doctor))
    when _clinic is not null then public.billing_owner_can_write(_clinic)
    else true end;
$$;

-- Billing state for the signed-in user (for the app's banner, billing page and login).
create or replace function public.my_billing_state()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  owner uuid; kind text; b record; t date; can boolean;
begin
  if uid is null then return null; end if;
  if exists (select 1 from public.clinics where id = uid) then owner := uid; kind := 'clinic';
  elsif exists (select 1 from public.doctors where id = uid) then
    owner := public.billing_owner_of_doctor(uid);
    kind := case when owner = uid then 'doctor' else 'clinic' end;
  else
    select coalesce(
      (select d.clinic_id from public.doctor_receptionists r join public.doctors d on d.id = r.doctor_id where r.user_id = uid and r.status = 'active' limit 1),
      (select r.doctor_id from public.doctor_receptionists r where r.user_id = uid and r.status = 'active' limit 1),
      (select clinic_id from public.clinic_receptionists where user_id = uid limit 1)
    ) into owner;
    if owner is null then return null; end if;
    kind := case when exists (select 1 from public.clinics where id = owner) then 'clinic' else 'doctor' end;
  end if;
  select * into b from public.billing_accounts where owner_id = owner;
  t := public.billing_trial_end(owner);
  can := public.billing_owner_can_write(owner);
  return jsonb_build_object(
    'owner_id', owner, 'kind', kind, 'is_owner', owner = uid,
    'exempt', coalesce(b.exempt, false), 'status', coalesce(b.status, 'none'),
    'trial_end', t, 'can_write', can,
    'current_period_end', b.current_period_end, 'cancel_at_period_end', coalesce(b.cancel_at_period_end, false),
    'quantity', b.quantity
  );
end $$;

revoke execute on function public.billing_owner_of_doctor(uuid), public.billing_trial_end(uuid),
  public.billing_owner_can_write(uuid), public.billing_write_ok(uuid, uuid), public.my_billing_state() from anon, public;
grant execute on function public.billing_owner_of_doctor(uuid), public.billing_trial_end(uuid),
  public.billing_owner_can_write(uuid), public.billing_write_ok(uuid, uuid), public.my_billing_state() to authenticated;

-- Restrictive "read-only when unpaid" policies on the working tables.
do $$
declare r record; expr text;
begin
  for r in
    select t.table_name,
      bool_or(c.column_name = 'doctor_id') as has_doc,
      bool_or(c.column_name = 'clinic_id') as has_cli,
      bool_or(c.column_name = 'created_by') as has_created_by
    from information_schema.tables t
    join information_schema.columns c on c.table_schema = t.table_schema and c.table_name = t.table_name
    where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
      and c.column_name in ('doctor_id', 'clinic_id', 'created_by')
      and t.table_name not in ('doctors', 'clinics', 'billing_accounts', 'app_secrets', 'clinic_payments', 'doctor_payments',
                               'referral_commissions', 'support_tickets', 'leads', 'seo_doctor_clinics', 'seo_doctor_faqs',
                               'doctor_calendar_links', 'clinic_receptionists', 'doctor_receptionists')
    group by t.table_name
  loop
    if r.has_doc and r.has_cli then expr := 'public.billing_write_ok(doctor_id, clinic_id)';
    elsif r.has_doc then expr := 'public.billing_write_ok(doctor_id)';
    elsif r.has_cli then expr := 'public.billing_write_ok(null, clinic_id)';
    elsif r.table_name = 'patients' then expr := 'public.billing_write_ok(created_by)';
    else continue;
    end if;
    execute format('drop policy if exists "Read-only when unpaid (insert)" on public.%I', r.table_name);
    execute format('drop policy if exists "Read-only when unpaid (update)" on public.%I', r.table_name);
    execute format('drop policy if exists "Read-only when unpaid (delete)" on public.%I', r.table_name);
    execute format('create policy "Read-only when unpaid (insert)" on public.%I as restrictive for insert to authenticated with check (%s)', r.table_name, expr);
    execute format('create policy "Read-only when unpaid (update)" on public.%I as restrictive for update to authenticated using (%s)', r.table_name, expr);
    execute format('create policy "Read-only when unpaid (delete)" on public.%I as restrictive for delete to authenticated using (%s)', r.table_name, expr);
  end loop;
end $$;

-- New clinics and independent doctors get a billing row (not exempt) so the admin list shows them.
create or replace function public.billing_account_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'clinics' then
    insert into public.billing_accounts (owner_id, kind) values (new.id, 'clinic') on conflict do nothing;
  elsif new.clinic_id is null then
    insert into public.billing_accounts (owner_id, kind) values (new.id, 'doctor') on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists billing_account_on_signup on public.clinics;
create trigger billing_account_on_signup after insert on public.clinics for each row execute function public.billing_account_on_signup();
drop trigger if exists billing_account_on_signup on public.doctors;
create trigger billing_account_on_signup after insert on public.doctors for each row execute function public.billing_account_on_signup();

insert into public.system_settings (key, value) values ('stripe_price_usd', '35') on conflict (key) do nothing;

-- Admin: create a billing row for an owner that has none (e.g. accounts made before this migration ran).
create or replace function public.admin_create_billing_account(_owner uuid, _kind text, _exempt boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin'::app_role) then raise exception 'Not allowed'; end if;
  if _kind not in ('clinic', 'doctor') then raise exception 'Bad kind'; end if;
  insert into public.billing_accounts (owner_id, kind, exempt) values (_owner, _kind, _exempt)
  on conflict (owner_id) do update set exempt = excluded.exempt, updated_at = now();
end $$;
revoke execute on function public.admin_create_billing_account(uuid, text, boolean) from anon, public;
grant execute on function public.admin_create_billing_account(uuid, text, boolean) to authenticated;

-- Clinics billed through Stripe don't use the manual monthly-payment check (read-only rules apply instead).
create or replace function public.is_clinic_active(_clinic_id uuid)
returns boolean language plpgsql stable security definer set search_path to 'public' as $function$
declare
  _clinic record;
  _required_month date;
  _paid boolean;
begin
  select id, status, billing_cycle_day into _clinic from public.clinics where id = _clinic_id;
  if not found then return false; end if;
  if _clinic.status <> 'active' then return false; end if;
  if exists (select 1 from public.billing_accounts where owner_id = _clinic_id and not exempt) then return true; end if;
  if _clinic.billing_cycle_day is null then return true; end if;
  _required_month := case
    when extract(day from current_date)::int <= _clinic.billing_cycle_day then date_trunc('month', current_date)::date
    else (date_trunc('month', current_date) + interval '1 month')::date
  end;
  select exists (
    select 1 from public.clinic_payments where clinic_id = _clinic_id and month = _required_month and status = 'paid'
  ) into _paid;
  return _paid;
end;
$function$;
