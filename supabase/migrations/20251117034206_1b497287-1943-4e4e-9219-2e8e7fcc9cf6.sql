-- Add approval status and contact fields to doctors table
ALTER TABLE public.doctors
ADD COLUMN approved boolean DEFAULT false NOT NULL,
ADD COLUMN city text,
ADD COLUMN contact_number text;

-- Add contact to profiles table for all users
ALTER TABLE public.profiles
ADD COLUMN city text;

-- Update RLS policies for doctors table to require approval
DROP POLICY IF EXISTS "Everyone can view doctors" ON public.doctors;

CREATE POLICY "Everyone can view approved doctors" 
ON public.doctors 
FOR SELECT 
USING (approved = true);

CREATE POLICY "Doctors can view own profile" 
ON public.doctors 
FOR SELECT 
USING (id = auth.uid());

-- Update has_role function to check if doctor is approved
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
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