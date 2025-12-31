-- Create procedures table for Ophthalmologists
CREATE TABLE public.procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- Doctors can view own procedures
CREATE POLICY "Doctors can view own procedures"
ON public.procedures
FOR SELECT
USING (doctor_id = auth.uid());

-- Doctors can insert own procedures
CREATE POLICY "Doctors can insert own procedures"
ON public.procedures
FOR INSERT
WITH CHECK (doctor_id = auth.uid());

-- Doctors can update own procedures
CREATE POLICY "Doctors can update own procedures"
ON public.procedures
FOR UPDATE
USING (doctor_id = auth.uid());

-- Doctors can delete own procedures
CREATE POLICY "Doctors can delete own procedures"
ON public.procedures
FOR DELETE
USING (doctor_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_procedures_updated_at
BEFORE UPDATE ON public.procedures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add procedure_id and procedure_fee columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN procedure_id UUID REFERENCES public.procedures(id),
ADD COLUMN procedure_fee NUMERIC DEFAULT 0;