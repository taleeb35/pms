-- Any signed-in user could give themselves the doctor or clinic role. Roles now come only from the
-- database: doctor via sync_doctor_role (when a doctor record is approved), clinic when a clinic
-- record is created, receptionists by their clinic/doctor, everything else by admins.
create or replace function public.add_clinic_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'clinic'::app_role)
  on conflict (user_id, role) do nothing;
  return new;
end $$;
drop trigger if exists add_clinic_role on public.clinics;
create trigger add_clinic_role after insert on public.clinics for each row execute function public.add_clinic_role();

drop policy if exists "Users can insert own clinic role" on public.user_roles;
drop policy if exists "Users can insert own doctor role" on public.user_roles;
