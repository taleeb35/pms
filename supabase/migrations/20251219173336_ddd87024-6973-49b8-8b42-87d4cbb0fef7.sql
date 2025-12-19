-- Create sick leave templates table
CREATE TABLE public.doctor_sick_leave_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work leave templates table
CREATE TABLE public.doctor_work_leave_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sick leave templates
ALTER TABLE public.doctor_sick_leave_templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on work leave templates
ALTER TABLE public.doctor_work_leave_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for sick leave templates
CREATE POLICY "Doctors can view own sick leave templates" 
ON public.doctor_sick_leave_templates 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own sick leave templates" 
ON public.doctor_sick_leave_templates 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own sick leave templates" 
ON public.doctor_sick_leave_templates 
FOR UPDATE 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own sick leave templates" 
ON public.doctor_sick_leave_templates 
FOR DELETE 
USING (doctor_id = auth.uid());

-- RLS policies for work leave templates
CREATE POLICY "Doctors can view own work leave templates" 
ON public.doctor_work_leave_templates 
FOR SELECT 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own work leave templates" 
ON public.doctor_work_leave_templates 
FOR INSERT 
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own work leave templates" 
ON public.doctor_work_leave_templates 
FOR UPDATE 
USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own work leave templates" 
ON public.doctor_work_leave_templates 
FOR DELETE 
USING (doctor_id = auth.uid());