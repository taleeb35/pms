-- Drop existing foreign key and recreate with ON DELETE SET NULL
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_procedure_id_fkey;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_procedure_id_fkey
FOREIGN KEY (procedure_id)
REFERENCES public.procedures(id)
ON DELETE SET NULL;