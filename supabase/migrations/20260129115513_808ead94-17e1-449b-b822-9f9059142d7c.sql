-- Create a table for SEO doctor clinic locations (multiple clinics per doctor)
CREATE TABLE public.seo_doctor_clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.seo_doctor_listings(id) ON DELETE CASCADE,
  clinic_name TEXT NOT NULL,
  clinic_location TEXT,
  timing TEXT,
  fee NUMERIC,
  map_query TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_doctor_clinics ENABLE ROW LEVEL SECURITY;

-- Allow content writers to manage clinics for doctors they created
CREATE POLICY "Content writers can view clinics for their doctors"
ON public.seo_doctor_clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_doctor_listings sdl
    WHERE sdl.id = doctor_id AND sdl.created_by = auth.uid()
  )
);

CREATE POLICY "Content writers can insert clinics for their doctors"
ON public.seo_doctor_clinics
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seo_doctor_listings sdl
    WHERE sdl.id = doctor_id AND sdl.created_by = auth.uid()
  )
);

CREATE POLICY "Content writers can update clinics for their doctors"
ON public.seo_doctor_clinics
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.seo_doctor_listings sdl
    WHERE sdl.id = doctor_id AND sdl.created_by = auth.uid()
  )
);

CREATE POLICY "Content writers can delete clinics for their doctors"
ON public.seo_doctor_clinics
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.seo_doctor_listings sdl
    WHERE sdl.id = doctor_id AND sdl.created_by = auth.uid()
  )
);

-- Allow public read access for published doctors
CREATE POLICY "Public can view clinics for published doctors"
ON public.seo_doctor_clinics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seo_doctor_listings sdl
    WHERE sdl.id = doctor_id AND sdl.is_published = true
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_seo_doctor_clinics_updated_at
BEFORE UPDATE ON public.seo_doctor_clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();