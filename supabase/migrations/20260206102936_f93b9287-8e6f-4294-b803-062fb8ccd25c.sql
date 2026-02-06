-- Update the add_default_specializations function to include new specializations
CREATE OR REPLACE FUNCTION public.add_default_specializations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.specializations (clinic_id, name)
  VALUES
    (NEW.id, 'Allergist'),
    (NEW.id, 'Anesthesiologist'),
    (NEW.id, 'Bariatric / Weight Loss Surgeon'),
    (NEW.id, 'Cancer Surgeon'),
    (NEW.id, 'Cardiologist'),
    (NEW.id, 'Cardiothoracic Surgeon'),
    (NEW.id, 'Clinical Nutritionist'),
    (NEW.id, 'Dermatologist'),
    (NEW.id, 'Emergency Medicine Specialist'),
    (NEW.id, 'Endocrinologist'),
    (NEW.id, 'Eye Surgeon'),
    (NEW.id, 'Gastroenterologist'),
    (NEW.id, 'General Physician'),
    (NEW.id, 'General Surgeon'),
    (NEW.id, 'Gynecologist'),
    (NEW.id, 'Hematologist'),
    (NEW.id, 'Infectious Disease Specialist'),
    (NEW.id, 'Internal Medicine Specialist'),
    (NEW.id, 'Internist'),
    (NEW.id, 'Laparoscopic Surgeon'),
    (NEW.id, 'Liver Specialist'),
    (NEW.id, 'Nephrologist'),
    (NEW.id, 'Neurologist'),
    (NEW.id, 'Neurosurgeon'),
    (NEW.id, 'Oncologist'),
    (NEW.id, 'Ophthalmologist'),
    (NEW.id, 'Oral Surgeon'),
    (NEW.id, 'Orthopedic Surgeon'),
    (NEW.id, 'Otolaryngologist'),
    (NEW.id, 'Pathologist'),
    (NEW.id, 'Pediatrician'),
    (NEW.id, 'Physiatrist'),
    (NEW.id, 'Physiotherapist'),
    (NEW.id, 'Plastic Surgeon'),
    (NEW.id, 'Psychiatrist'),
    (NEW.id, 'Pulmonologist'),
    (NEW.id, 'Radiologist'),
    (NEW.id, 'Rheumatologist'),
    (NEW.id, 'Urologist');
  
  RETURN NEW;
END;
$function$;