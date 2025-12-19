-- Create table for doctor disease templates
CREATE TABLE public.doctor_disease_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  disease_name TEXT NOT NULL,
  prescription_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_disease_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctors
CREATE POLICY "Doctors can view own disease templates"
ON public.doctor_disease_templates
FOR SELECT
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own disease templates"
ON public.doctor_disease_templates
FOR INSERT
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own disease templates"
ON public.doctor_disease_templates
FOR UPDATE
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own disease templates"
ON public.doctor_disease_templates
FOR DELETE
USING (doctor_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_doctor_disease_templates_updated_at
BEFORE UPDATE ON public.doctor_disease_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();