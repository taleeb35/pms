-- Create test templates table for doctors
CREATE TABLE public.doctor_test_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_test_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Doctors can view own test templates" 
ON public.doctor_test_templates 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own test templates" 
ON public.doctor_test_templates 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own test templates" 
ON public.doctor_test_templates 
FOR UPDATE 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own test templates" 
ON public.doctor_test_templates 
FOR DELETE 
USING (doctor_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_doctor_test_templates_updated_at
BEFORE UPDATE ON public.doctor_test_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();