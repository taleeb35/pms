-- H1: when a user has two-factor login on, their data access requires a
-- session that passed the code step (aal2). Users without two-factor are unaffected.
create or replace function public.mfa_ok()
returns boolean
language sql stable security definer set search_path = public, auth
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified');
$$;
revoke all on function public.mfa_ok() from public;
grant execute on function public.mfa_ok() to authenticated;

do $$
declare t record;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity loop
    execute format('drop policy if exists "Two-factor required" on public.%I', t.relname);
    execute format('create policy "Two-factor required" on public.%I as restrictive for all to authenticated using ((select public.mfa_ok())) with check ((select public.mfa_ok()))', t.relname);
  end loop;
end $$;

drop policy if exists "Two-factor required" on storage.objects;
create policy "Two-factor required" on storage.objects as restrictive for all to authenticated
  using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
