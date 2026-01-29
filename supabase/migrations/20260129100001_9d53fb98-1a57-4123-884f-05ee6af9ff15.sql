-- Add missing columns to seo_doctor_listings for content writer form
ALTER TABLE public.seo_doctor_listings
ADD COLUMN IF NOT EXISTS pmdc_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS clinic_name text,
ADD COLUMN IF NOT EXISTS timing text,
ADD COLUMN IF NOT EXISTS clinic_location text;

-- Add RLS policy for content writers to manage seo_doctor_listings
CREATE POLICY "Content writers can insert seo_doctor_listings"
ON public.seo_doctor_listings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'content_writer'::app_role));

CREATE POLICY "Content writers can update own seo_doctor_listings"
ON public.seo_doctor_listings
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Content writers can delete own seo_doctor_listings"
ON public.seo_doctor_listings
FOR DELETE
USING (created_by = auth.uid());

CREATE POLICY "Content writers can view all seo_doctor_listings"
ON public.seo_doctor_listings
FOR SELECT
USING (has_role(auth.uid(), 'content_writer'::app_role));