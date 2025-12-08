-- Create clinic_allergies table
CREATE TABLE public.clinic_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, name)
);

-- Create clinic_diseases table
CREATE TABLE public.clinic_diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, name)
);

-- Enable RLS
ALTER TABLE public.clinic_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_diseases ENABLE ROW LEVEL SECURITY;

-- RLS policies for clinic_allergies
CREATE POLICY "Clinics can view own allergies" ON public.clinic_allergies
  FOR SELECT USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own allergies" ON public.clinic_allergies
  FOR INSERT WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can update own allergies" ON public.clinic_allergies
  FOR UPDATE USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own allergies" ON public.clinic_allergies
  FOR DELETE USING (clinic_id = auth.uid());

CREATE POLICY "Doctors can view their clinic allergies" ON public.clinic_allergies
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_allergies.clinic_id
  ));

-- RLS policies for clinic_diseases
CREATE POLICY "Clinics can view own diseases" ON public.clinic_diseases
  FOR SELECT USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can insert own diseases" ON public.clinic_diseases
  FOR INSERT WITH CHECK (clinic_id = auth.uid());

CREATE POLICY "Clinics can update own diseases" ON public.clinic_diseases
  FOR UPDATE USING (clinic_id = auth.uid());

CREATE POLICY "Clinics can delete own diseases" ON public.clinic_diseases
  FOR DELETE USING (clinic_id = auth.uid());

CREATE POLICY "Doctors can view their clinic diseases" ON public.clinic_diseases
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.doctors WHERE doctors.id = auth.uid() AND doctors.clinic_id = clinic_diseases.clinic_id
  ));