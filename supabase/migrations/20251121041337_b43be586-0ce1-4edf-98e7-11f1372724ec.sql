-- Create wait_list table for managing patients scheduled for future follow-ups
CREATE TABLE public.wait_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wait_list ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own wait list entries
CREATE POLICY "Doctors can view own wait list"
ON public.wait_list
FOR SELECT
USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Doctors can insert their own wait list entries
CREATE POLICY "Doctors can insert wait list"
ON public.wait_list
FOR INSERT
WITH CHECK (doctor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Doctors can update their own wait list entries
CREATE POLICY "Doctors can update own wait list"
ON public.wait_list
FOR UPDATE
USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Doctors can delete their own wait list entries
CREATE POLICY "Doctors can delete own wait list"
ON public.wait_list
FOR DELETE
USING (doctor_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_wait_list_updated_at
BEFORE UPDATE ON public.wait_list
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();