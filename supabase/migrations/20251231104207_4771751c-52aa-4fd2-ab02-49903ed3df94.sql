-- Create doctor_receptionists table for single doctors
CREATE TABLE public.doctor_receptionists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, user_id)
);

-- Enable RLS
ALTER TABLE public.doctor_receptionists ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own receptionists
CREATE POLICY "Doctors can view own receptionists"
ON public.doctor_receptionists
FOR SELECT
USING (doctor_id = auth.uid());

-- Doctors can insert their own receptionists
CREATE POLICY "Doctors can insert own receptionists"
ON public.doctor_receptionists
FOR INSERT
WITH CHECK (doctor_id = auth.uid());

-- Doctors can update their own receptionists
CREATE POLICY "Doctors can update own receptionists"
ON public.doctor_receptionists
FOR UPDATE
USING (doctor_id = auth.uid());

-- Doctors can delete their own receptionists
CREATE POLICY "Doctors can delete own receptionists"
ON public.doctor_receptionists
FOR DELETE
USING (doctor_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_doctor_receptionists_updated_at
BEFORE UPDATE ON public.doctor_receptionists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to get doctor's receptionist clinic id
CREATE OR REPLACE FUNCTION public.get_doctor_receptionist_doctor_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT doctor_id
  FROM public.doctor_receptionists
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;