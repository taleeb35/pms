begin;
update system_settings set value = '35' where key = 'doctor_monthly_fee';
insert into system_settings (key, value) values ('single_doctor_monthly_fee', '35') on conflict (key) do update set value = '35';
update clinic_payments
   set amount = 35 * greatest(coalesce(doctor_count, 1), 1),
       notes = trim(both ' ' from coalesce(notes, '') || ' Repriced to USD $35/practitioner on 2026-11-16 (was ' || amount || ').'),
       updated_at = now()
 where status = 'pending';
update clinic_payments set notes = trim(both ' ' from coalesce(notes, '') || ' Paid in PKR before the move to USD pricing.') where status = 'paid' and amount = 5999;
commit;
select key || '=' || value from system_settings where key like '%fee%';
select status || ': ' || count(*) || ' rows, amounts ' || string_agg(distinct amount::text, ',') from clinic_payments group by status;
