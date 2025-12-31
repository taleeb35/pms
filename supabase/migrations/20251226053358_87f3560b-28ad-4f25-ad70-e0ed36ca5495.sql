-- Create a function to add default specializations for new clinics
CREATE OR REPLACE FUNCTION public.add_default_specializations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.specializations (clinic_id, name)
  VALUES
    (NEW.id, 'Allergist'),
    (NEW.id, 'Anesthesiologist'),
    (NEW.id, 'Cardiologist'),
    (NEW.id, 'Cardiothoracic Surgeon'),
    (NEW.id, 'Dermatologist'),
    (NEW.id, 'Emergency Medicine Specialist'),
    (NEW.id, 'Endocrinologist'),
    (NEW.id, 'Gastroenterologist'),
    (NEW.id, 'General Physician'),
    (NEW.id, 'General Surgeon'),
    (NEW.id, 'Gynecologist'),
    (NEW.id, 'Hematologist'),
    (NEW.id, 'Infectious Disease Specialist'),
    (NEW.id, 'Internal Medicine Specialist'),
    (NEW.id, 'Internist'),
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
    (NEW.id, 'Plastic Surgeon'),
    (NEW.id, 'Psychiatrist'),
    (NEW.id, 'Pulmonologist'),
    (NEW.id, 'Radiologist'),
    (NEW.id, 'Rheumatologist'),
    (NEW.id, 'Urologist');
  
  RETURN NEW;
END;
$$;

-- Create a trigger that fires after a new clinic is inserted
CREATE TRIGGER trigger_add_default_specializations
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.add_default_specializations();