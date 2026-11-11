-- Security hardening (2026-11-11)
-- 1. Referral partners: signup / login / dashboard go through server-side
--    functions that verify email + referral code, instead of public table reads.
-- 2. Remove "anyone can read" rules that exposed partners, commissions,
--    referred clinics/doctors and their profile details.
-- 3. Logged-out visitors may only read public profile columns (no email/phone/DOB/address).

create or replace function public.referral_partner_signup(p_full_name text, p_email text, p_phone text)
returns text
language plpgsql security definer set search_path = public
as $$
declare v_code text;
begin
  if coalesce(trim(p_full_name), '') = '' or coalesce(trim(p_email), '') = '' then
    raise exception 'Name and email are required' using errcode = '22023';
  end if;
  insert into public.referral_partners (full_name, email, phone, referral_code, status)
  values (trim(p_full_name), lower(trim(p_email)), nullif(trim(coalesce(p_phone, '')), ''), 'TEMP', 'active')
  returning referral_code into v_code;
  return v_code;
end $$;

create or replace function public.referral_partner_login(p_email text, p_code text)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select to_jsonb(rp) from public.referral_partners rp
   where lower(rp.email) = lower(trim(p_email)) and rp.referral_code = upper(trim(p_code))
   limit 1;
$$;

create or replace function public.referral_partner_dashboard(p_email text, p_code text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare p public.referral_partners;
begin
  select * into p from public.referral_partners
   where lower(email) = lower(trim(p_email)) and referral_code = upper(trim(p_code))
     and status in ('approved', 'active');
  if not found then return null; end if;
  return jsonb_build_object(
    'partner', to_jsonb(p),
    'commissions', coalesce((select jsonb_agg(to_jsonb(c) order by c.month desc)
                               from public.referral_commissions c where c.referral_partner_id = p.id), '[]'::jsonb),
    'referrals', coalesce((
      select jsonb_agg(r order by r->>'created_at' desc) from (
        select jsonb_build_object('id', c.id, 'name', c.clinic_name, 'email', pr.email, 'type', 'clinic',
                                  'status', c.status, 'created_at', c.created_at) r
          from public.clinics c left join public.profiles pr on pr.id = c.id
         where c.referred_by = p.referral_code
        union all
        select jsonb_build_object('id', d.id, 'name', coalesce(pr.full_name, d.specialization), 'email', pr.email,
                                  'type', 'doctor', 'status', case when d.approved then 'active' else 'pending' end,
                                  'created_at', d.created_at)
          from public.doctors d left join public.profiles pr on pr.id = d.id
         where d.referred_by = p.referral_code
      ) x), '[]'::jsonb)
  );
end $$;

revoke all on function public.referral_partner_signup(text, text, text) from public;
revoke all on function public.referral_partner_login(text, text) from public;
revoke all on function public.referral_partner_dashboard(text, text) from public;
grant execute on function public.referral_partner_signup(text, text, text) to anon, authenticated;
grant execute on function public.referral_partner_login(text, text) to anon, authenticated;
grant execute on function public.referral_partner_dashboard(text, text) to anon, authenticated;

drop policy if exists "Users can select own referral partner record by email" on public.referral_partners;
drop policy if exists "Anyone can signup as referral partner" on public.referral_partners;
drop policy if exists "Anyone can view commissions" on public.referral_commissions;
drop policy if exists "Anyone can view clinics with referral code" on public.clinics;
drop policy if exists "Anyone can view doctors with referral code" on public.doctors;
drop policy if exists "Anyone can view profiles of referred users" on public.profiles;

-- Logged-out visitors: only public profile columns of approved doctors.
revoke select on public.profiles from anon;
grant select (id, full_name, avatar_url, city, gender) on public.profiles to anon;
