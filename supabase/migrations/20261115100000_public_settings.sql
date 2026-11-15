-- A8: support WhatsApp number is a setting (Admin -> Settings), not hard-coded.
-- Logged-out pages read only whitelisted keys through this function.
insert into public.system_settings (key, value)
values ('support_whatsapp', '923004313139')
on conflict (key) do nothing;

create or replace function public.get_public_settings()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
    from public.system_settings
   where key in ('support_whatsapp');
$$;

revoke all on function public.get_public_settings() from public;
grant execute on function public.get_public_settings() to anon, authenticated;
