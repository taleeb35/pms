-- A6: a new patient's country defaults to the clinic's (or solo doctor's) country.
create or replace function public.set_patient_country()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.country_code is null then
    select coalesce(c.country_code, d.country_code) into new.country_code
      from region_owner() o
      left join clinics c on o.owner_type = 'clinic' and c.id = o.owner_id
      left join doctors d on o.owner_type = 'doctor' and d.id = o.owner_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_set_patient_country on public.patients;
create trigger trg_set_patient_country before insert on public.patients
  for each row execute function public.set_patient_country();

-- Existing patients take their clinic's / doctor's country (all Pakistan today).
update public.patients set country_code = 'PK' where country_code is null;
