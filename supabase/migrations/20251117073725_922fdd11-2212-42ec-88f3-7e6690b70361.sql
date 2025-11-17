-- Create/replace trigger function to sync doctor role with approval status
CREATE OR REPLACE FUNCTION public.sync_doctor_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.approved = true THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'doctor'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- If approval is revoked, remove the doctor role
    DELETE FROM public.user_roles
    WHERE user_id = NEW.id AND role = 'doctor'::app_role;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is updated
DROP TRIGGER IF EXISTS trg_sync_doctor_role ON public.doctors;
CREATE TRIGGER trg_sync_doctor_role
AFTER INSERT OR UPDATE OF approved ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.sync_doctor_role();