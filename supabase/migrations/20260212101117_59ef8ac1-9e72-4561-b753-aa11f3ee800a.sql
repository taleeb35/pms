
-- Create FAQs table for SEO doctor listings
CREATE TABLE public.seo_doctor_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.seo_doctor_listings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_doctor_faqs ENABLE ROW LEVEL SECURITY;

-- Public can view FAQs for published doctors
CREATE POLICY "Public can view FAQs for published doctors"
ON public.seo_doctor_faqs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM seo_doctor_listings sdl
  WHERE sdl.id = seo_doctor_faqs.doctor_id AND sdl.is_published = true
));

-- Content writers can view FAQs for their doctors
CREATE POLICY "Content writers can view FAQs for their doctors"
ON public.seo_doctor_faqs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM seo_doctor_listings sdl
  WHERE sdl.id = seo_doctor_faqs.doctor_id AND sdl.created_by = auth.uid()
));

-- Content writers can insert FAQs for their doctors
CREATE POLICY "Content writers can insert FAQs for their doctors"
ON public.seo_doctor_faqs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM seo_doctor_listings sdl
  WHERE sdl.id = seo_doctor_faqs.doctor_id AND sdl.created_by = auth.uid()
));

-- Content writers can update FAQs for their doctors
CREATE POLICY "Content writers can update FAQs for their doctors"
ON public.seo_doctor_faqs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM seo_doctor_listings sdl
  WHERE sdl.id = seo_doctor_faqs.doctor_id AND sdl.created_by = auth.uid()
));

-- Content writers can delete FAQs for their doctors
CREATE POLICY "Content writers can delete FAQs for their doctors"
ON public.seo_doctor_faqs
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM seo_doctor_listings sdl
  WHERE sdl.id = seo_doctor_faqs.doctor_id AND sdl.created_by = auth.uid()
));

-- Create index for performance
CREATE INDEX idx_seo_doctor_faqs_doctor_id ON public.seo_doctor_faqs(doctor_id);
