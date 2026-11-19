-- Referral partners sign in with email + 8-character code. Limit wrong attempts per email
-- (10 per 15 minutes) so the code can't be guessed. Successful sign-in clears the count.
create table if not exists public.referral_login_attempts (
  email text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists referral_login_attempts_idx on public.referral_login_attempts (email, attempted_at);
alter table public.referral_login_attempts enable row level security;
revoke all on public.referral_login_attempts from anon, authenticated;

create or replace function public.referral_partner_check_limit(p_email text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.referral_login_attempts where attempted_at < now() - interval '1 day';
  if (select count(*) from public.referral_login_attempts
      where email = lower(trim(p_email)) and attempted_at > now() - interval '15 minutes') >= 10 then
    raise exception 'Too many attempts. Please try again in 15 minutes.' using errcode = '42501';
  end if;
end $$;
revoke execute on function public.referral_partner_check_limit(text) from anon, authenticated, public;

create or replace function public.referral_partner_login(p_email text, p_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare r jsonb;
begin
  perform public.referral_partner_check_limit(p_email);
  select to_jsonb(rp) into r from public.referral_partners rp
   where lower(rp.email) = lower(trim(p_email)) and rp.referral_code = upper(trim(p_code))
   limit 1;
  if r is null then
    insert into public.referral_login_attempts (email) values (lower(trim(p_email)));
  else
    delete from public.referral_login_attempts where email = lower(trim(p_email));
  end if;
  return r;
end $$;

create or replace function public.referral_partner_dashboard(p_email text, p_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare p public.referral_partners;
begin
  perform public.referral_partner_check_limit(p_email);
  select * into p from public.referral_partners
   where lower(email) = lower(trim(p_email)) and referral_code = upper(trim(p_code))
     and status in ('approved', 'active');
  if not found then
    insert into public.referral_login_attempts (email) values (lower(trim(p_email)));
    return null;
  end if;
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

grant execute on function public.referral_partner_login(text, text), public.referral_partner_dashboard(text, text) to anon, authenticated;

-- Forgot password: the eligibility check now runs only inside the reset email function, so visitors
-- can't ask whether an email belongs to a pending account.
revoke execute on function public.check_password_reset_eligibility(text) from anon, authenticated, public;
grant execute on function public.check_password_reset_eligibility(text) to service_role;
