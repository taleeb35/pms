-- Make doctor_id nullable in template tables for clinic-created templates
ALTER TABLE public.doctor_disease_templates 
  ALTER COLUMN doctor_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS doctor_disease_templates_doctor_id_fkey;

ALTER TABLE public.doctor_test_templates 
  ALTER COLUMN doctor_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS doctor_test_templates_doctor_id_fkey;

ALTER TABLE public.doctor_report_templates 
  ALTER COLUMN doctor_id DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS doctor_report_templates_doctor_id_fkey;

-- Re-add the foreign key with ON DELETE CASCADE but allowing NULL
ALTER TABLE public.doctor_disease_templates
  ADD CONSTRAINT doctor_disease_templates_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

ALTER TABLE public.doctor_test_templates
  ADD CONSTRAINT doctor_test_templates_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

ALTER TABLE public.doctor_report_templates
  ADD CONSTRAINT doctor_report_templates_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;