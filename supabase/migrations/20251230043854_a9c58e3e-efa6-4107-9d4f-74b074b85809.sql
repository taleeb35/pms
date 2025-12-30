-- Function to add default allergies for new clinics
CREATE OR REPLACE FUNCTION public.add_default_allergies()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.clinic_allergies (clinic_id, name)
  VALUES
    (NEW.id, 'Penicillin'),
    (NEW.id, 'Aspirin'),
    (NEW.id, 'Ibuprofen'),
    (NEW.id, 'Sulfa Drugs'),
    (NEW.id, 'Codeine'),
    (NEW.id, 'Amoxicillin'),
    (NEW.id, 'Cephalosporins'),
    (NEW.id, 'Peanuts'),
    (NEW.id, 'Tree Nuts'),
    (NEW.id, 'Shellfish'),
    (NEW.id, 'Fish'),
    (NEW.id, 'Milk'),
    (NEW.id, 'Eggs'),
    (NEW.id, 'Wheat'),
    (NEW.id, 'Soy'),
    (NEW.id, 'Dust Mites'),
    (NEW.id, 'Pollen'),
    (NEW.id, 'Mold'),
    (NEW.id, 'Pet Dander'),
    (NEW.id, 'Latex'),
    (NEW.id, 'Bee Stings'),
    (NEW.id, 'Insect Bites'),
    (NEW.id, 'Nickel'),
    (NEW.id, 'Perfumes'),
    (NEW.id, 'NSAIDs'),
    (NEW.id, 'Contrast Dye'),
    (NEW.id, 'Local Anesthetics'),
    (NEW.id, 'General Anesthetics');
  
  RETURN NEW;
END;
$function$;

-- Function to add default diseases for new clinics
CREATE OR REPLACE FUNCTION public.add_default_diseases()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.clinic_diseases (clinic_id, name)
  VALUES
    (NEW.id, 'Hypertension'),
    (NEW.id, 'Diabetes Type 1'),
    (NEW.id, 'Diabetes Type 2'),
    (NEW.id, 'Asthma'),
    (NEW.id, 'COPD'),
    (NEW.id, 'Coronary Artery Disease'),
    (NEW.id, 'Heart Failure'),
    (NEW.id, 'Arrhythmia'),
    (NEW.id, 'Stroke'),
    (NEW.id, 'Epilepsy'),
    (NEW.id, 'Migraine'),
    (NEW.id, 'Parkinson''s Disease'),
    (NEW.id, 'Alzheimer''s Disease'),
    (NEW.id, 'Arthritis'),
    (NEW.id, 'Rheumatoid Arthritis'),
    (NEW.id, 'Osteoporosis'),
    (NEW.id, 'Chronic Kidney Disease'),
    (NEW.id, 'Liver Disease'),
    (NEW.id, 'Hepatitis B'),
    (NEW.id, 'Hepatitis C'),
    (NEW.id, 'HIV/AIDS'),
    (NEW.id, 'Tuberculosis'),
    (NEW.id, 'Cancer'),
    (NEW.id, 'Thyroid Disorder'),
    (NEW.id, 'Hyperthyroidism'),
    (NEW.id, 'Hypothyroidism'),
    (NEW.id, 'Anemia'),
    (NEW.id, 'Depression'),
    (NEW.id, 'Anxiety Disorder'),
    (NEW.id, 'Bipolar Disorder'),
    (NEW.id, 'GERD'),
    (NEW.id, 'Peptic Ulcer'),
    (NEW.id, 'IBS'),
    (NEW.id, 'Crohn''s Disease'),
    (NEW.id, 'Ulcerative Colitis'),
    (NEW.id, 'Glaucoma'),
    (NEW.id, 'Cataracts'),
    (NEW.id, 'Sleep Apnea'),
    (NEW.id, 'Obesity'),
    (NEW.id, 'High Cholesterol');
  
  RETURN NEW;
END;
$function$;

-- Create trigger for default allergies
CREATE TRIGGER add_clinic_default_allergies
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.add_default_allergies();

-- Create trigger for default diseases
CREATE TRIGGER add_clinic_default_diseases
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.add_default_diseases();