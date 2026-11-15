-- A2-A6: per-account region settings (country, currency, timezone).
-- Clinics own the settings for everyone in the clinic; solo doctors own their own.
-- Existing accounts keep today's behaviour: Pakistan / PKR / Asia/Karachi.

alter table public.clinics
  add column if not exists country_code text not null default 'PK',
  add column if not exists currency_code text not null default 'PKR',
  add column if not exists timezone text not null default 'Asia/Karachi';

alter table public.doctors
  add column if not exists country_code text not null default 'PK',
  add column if not exists currency_code text not null default 'PKR',
  add column if not exists timezone text not null default 'Asia/Karachi';

alter table public.patients
  add column if not exists country_code text;

-- Whose settings apply to the signed-in user.
create or replace function public.region_owner()
returns table (owner_type text, owner_id uuid)
language sql stable security definer set search_path = public
as $$
  select 'clinic', c.id from clinics c where c.id = auth.uid()
  union all
  select case when d.clinic_id is null then 'doctor' else 'clinic' end, coalesce(d.clinic_id, d.id)
    from doctors d where d.id = auth.uid()
  union all
  select 'clinic', cr.clinic_id from clinic_receptionists cr where cr.user_id = auth.uid()
  union all
  select case when d.clinic_id is null then 'doctor' else 'clinic' end, coalesce(d.clinic_id, d.id)
    from doctor_receptionists dr join doctors d on d.id = dr.doctor_id where dr.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.get_my_region()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce((
    select jsonb_build_object(
      'owner_type', o.owner_type,
      'can_edit', o.owner_id = auth.uid(),
      'country_code', coalesce(c.country_code, d.country_code),
      'currency_code', coalesce(c.currency_code, d.currency_code),
      'timezone', coalesce(c.timezone, d.timezone))
    from region_owner() o
    left join clinics c on o.owner_type = 'clinic' and c.id = o.owner_id
    left join doctors d on o.owner_type = 'doctor' and d.id = o.owner_id
  ), jsonb_build_object('owner_type', null, 'can_edit', false,
                        'country_code', 'PK', 'currency_code', 'PKR', 'timezone', 'Asia/Karachi'));
$$;

-- Only the clinic owner or a solo doctor can change the settings.
create or replace function public.update_my_region(p_country text, p_currency text, p_timezone text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare o record;
begin
  if p_country !~ '^[A-Z]{2}$' or p_currency !~ '^[A-Z]{3}$' or coalesce(p_timezone, '') = ''
     or not exists (select 1 from pg_timezone_names where name = p_timezone) then
    raise exception 'Invalid country, currency or timezone' using errcode = '22023';
  end if;
  select * into o from region_owner();
  if o.owner_id is null or o.owner_id <> auth.uid() then
    raise exception 'Only the clinic owner or a solo doctor can change these settings' using errcode = '42501';
  end if;
  if o.owner_type = 'clinic' then
    update clinics set country_code = p_country, currency_code = p_currency, timezone = p_timezone where id = o.owner_id;
  else
    update doctors set country_code = p_country, currency_code = p_currency, timezone = p_timezone where id = o.owner_id;
  end if;
  return get_my_region();
end $$;

revoke all on function public.region_owner() from public;
revoke all on function public.get_my_region() from public;
revoke all on function public.update_my_region(text, text, text) from public;
grant execute on function public.get_my_region() to authenticated;
grant execute on function public.update_my_region(text, text, text) to authenticated;
