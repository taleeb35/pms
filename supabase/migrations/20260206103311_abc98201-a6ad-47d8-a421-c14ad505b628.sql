-- Add new specializations to all existing clinics
INSERT INTO public.specializations (clinic_id, name)
SELECT c.id, s.name
FROM public.clinics c
CROSS JOIN (
  VALUES 
    ('Clinical Nutritionist'),
    ('Liver Specialist'),
    ('Physiotherapist'),
    ('Bariatric / Weight Loss Surgeon'),
    ('Laparoscopic Surgeon'),
    ('Cancer Surgeon'),
    ('Eye Surgeon')
) AS s(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.specializations sp 
  WHERE sp.clinic_id = c.id AND sp.name = s.name
);