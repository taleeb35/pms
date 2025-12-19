-- Create a table for doctor report templates
CREATE TABLE public.doctor_report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctor_report_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor access only
CREATE POLICY "Doctors can view own report templates" 
ON public.doctor_report_templates 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own report templates" 
ON public.doctor_report_templates 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own report templates" 
ON public.doctor_report_templates 
FOR UPDATE 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own report templates" 
ON public.doctor_report_templates 
FOR DELETE 
USING (doctor_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_doctor_report_templates_updated_at
BEFORE UPDATE ON public.doctor_report_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();