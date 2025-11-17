-- Fix search path for has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.doctors d ON d.id = _user_id AND _role = 'doctor'
    WHERE ur.user_id = _user_id 
      AND ur.role = _role
      AND (_role != 'doctor' OR d.approved = true)
  )
$$;