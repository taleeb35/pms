-- Sign-up pages need to check a referral code before the visitor has an account.
-- Returns only 'valid', 'inactive' or 'invalid' (nothing else about the partner).
create or replace function public.check_referral_code(p_code text)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce((
    select case when status in ('approved', 'active') then 'valid' else 'inactive' end
    from public.referral_partners
    where referral_code = upper(trim(p_code))
    limit 1
  ), 'invalid');
$$;
revoke all on function public.check_referral_code(text) from public;
grant execute on function public.check_referral_code(text) to anon, authenticated;
