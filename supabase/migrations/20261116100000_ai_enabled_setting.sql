-- Hide AI tools until an AI key is configured on the server; turn on with:
--   update system_settings set value = 'true' where key = 'ai_enabled';
insert into public.system_settings (key, value) values ('ai_enabled', 'false') on conflict (key) do nothing;

create or replace function public.get_public_settings()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
    from public.system_settings
   where key in ('support_whatsapp', 'support_email', 'doctor_monthly_fee', 'single_doctor_monthly_fee', 'ai_enabled');
$$;
