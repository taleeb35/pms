-- Doctors and logged-out visitors need the support email and the published fee.
create or replace function public.get_public_settings()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
    from public.system_settings
   where key in ('support_whatsapp', 'support_email', 'doctor_monthly_fee', 'single_doctor_monthly_fee');
$$;
