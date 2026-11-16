-- Merge a duplicate patient into the one being kept.
-- Moves every appointment, visit, prescription, document, invoice, waitlist entry and membership
-- from the duplicate to the kept patient, fills the kept patient's empty details from the duplicate,
-- then deletes the duplicate. All in one transaction: it either fully happens or not at all.
-- Allowed for: the doctor who owns both patients, the clinic owner when both belong to its doctors, admins.
create or replace function public.merge_patients(p_keep uuid, p_dup uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  k public.patients%rowtype;
  d public.patients%rowtype;
  allowed boolean;
  moved jsonb := '{}'::jsonb;
  n int;
  hist text;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if not public.mfa_ok() then raise exception 'Two-factor sign-in required'; end if;
  if p_keep = p_dup then raise exception 'Choose two different patients'; end if;

  select * into k from public.patients where id = p_keep for update;
  select * into d from public.patients where id = p_dup for update;
  if k.id is null or d.id is null then raise exception 'Patient not found'; end if;

  allowed := public.has_role(uid, 'admin'::app_role)
    or (public.has_role(uid, 'doctor'::app_role) and k.created_by = uid and d.created_by = uid)
    or (exists (select 1 from public.doctors x where x.id = k.created_by and x.clinic_id = uid)
        and exists (select 1 from public.doctors y where y.id = d.created_by and y.clinic_id = uid));
  if not allowed then raise exception 'You can only merge your own patients'; end if;

  update public.appointments set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('appointments', n);
  update public.visit_records set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('visit_records', n);
  update public.appointment_prescribed_medicines set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('prescribed_medicines', n);
  update public.medical_records set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('medical_records', n);
  update public.prescriptions set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('prescriptions', n);
  update public.medical_documents set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('documents', n);
  update public.invoices set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('invoices', n);
  update public.wait_list set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('waitlist', n);
  update public.patient_memberships set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('memberships', n);
  update public.medical_certificates set patient_id = p_keep where patient_id = p_dup; get diagnostics n = row_count; moved := moved || jsonb_build_object('certificates', n);

  -- Medical history is a JSON list of entries: join both lists (plain text is joined as text).
  hist := k.medical_history;
  if coalesce(d.medical_history, '') <> '' then
    if coalesce(k.medical_history, '') = '' then hist := d.medical_history;
    else
      begin
        hist := (k.medical_history::jsonb || d.medical_history::jsonb)::text;
      exception when others then
        hist := k.medical_history || chr(10) || d.medical_history;
      end;
    end if;
  end if;

  -- Fill empty details on the kept patient; join free-text history so nothing is lost.
  update public.patients set
    email = coalesce(nullif(k.email, ''), d.email),
    phone = coalesce(nullif(k.phone, ''), d.phone),
    gender = coalesce(k.gender, d.gender),
    date_of_birth = coalesce(k.date_of_birth, d.date_of_birth),
    blood_group = coalesce(nullif(k.blood_group, ''), d.blood_group),
    address = coalesce(nullif(k.address, ''), d.address),
    city = coalesce(nullif(k.city, ''), d.city),
    cnic = coalesce(nullif(k.cnic, ''), d.cnic),
    father_name = coalesce(nullif(k.father_name, ''), d.father_name),
    marital_status = coalesce(nullif(k.marital_status, ''), d.marital_status),
    emergency_contact_name = coalesce(nullif(k.emergency_contact_name, ''), d.emergency_contact_name),
    emergency_contact_phone = coalesce(nullif(k.emergency_contact_phone, ''), d.emergency_contact_phone),
    pregnancy_start_date = coalesce(k.pregnancy_start_date, d.pregnancy_start_date),
    allergies = case when coalesce(d.allergies, '') = '' or coalesce(k.allergies, '') = d.allergies then k.allergies
                     when coalesce(k.allergies, '') = '' then d.allergies else k.allergies || ', ' || d.allergies end,
    major_diseases = case when coalesce(d.major_diseases, '') = '' or coalesce(k.major_diseases, '') = d.major_diseases then k.major_diseases
                     when coalesce(k.major_diseases, '') = '' then d.major_diseases else k.major_diseases || ', ' || d.major_diseases end,
    medical_history = hist,
    updated_at = now()
  where id = p_keep;

  delete from public.patients where id = p_dup;

  insert into public.activity_logs (user_id, action, entity_type, entity_id, details)
  values (uid, 'patient_merged', 'patient', p_keep, jsonb_build_object(
    'kept', k.full_name, 'kept_patient_id', k.patient_id,
    'merged', d.full_name, 'merged_patient_id', d.patient_id, 'moved', moved,
    'doctorId', k.created_by, 'patient_name', k.full_name));

  return moved;
end;
$$;

revoke all on function public.merge_patients(uuid, uuid) from public, anon;
grant execute on function public.merge_patients(uuid, uuid) to authenticated;
