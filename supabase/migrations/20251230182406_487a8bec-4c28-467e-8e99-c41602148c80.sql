-- Create doctor_allergies table for single doctors
CREATE TABLE public.doctor_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_diseases table for single doctors
CREATE TABLE public.doctor_diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor_icd_codes table for single doctors
CREATE TABLE public.doctor_icd_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.doctor_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_icd_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_allergies
CREATE POLICY "Doctors can manage own allergies" ON public.doctor_allergies
FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

-- RLS policies for doctor_diseases
CREATE POLICY "Doctors can manage own diseases" ON public.doctor_diseases
FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

-- RLS policies for doctor_icd_codes
CREATE POLICY "Doctors can manage own ICD codes" ON public.doctor_icd_codes
FOR ALL USING (doctor_id = auth.uid()) WITH CHECK (doctor_id = auth.uid());

-- Create function to add default allergies for single doctors
CREATE OR REPLACE FUNCTION public.add_default_doctor_allergies()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add for single doctors (no clinic_id)
  IF NEW.clinic_id IS NULL THEN
    INSERT INTO public.doctor_allergies (doctor_id, name)
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to add default diseases for single doctors
CREATE OR REPLACE FUNCTION public.add_default_doctor_diseases()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add for single doctors (no clinic_id)
  IF NEW.clinic_id IS NULL THEN
    INSERT INTO public.doctor_diseases (doctor_id, name)
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to add default ICD codes for single doctors
CREATE OR REPLACE FUNCTION public.add_default_doctor_icd_codes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add for single doctors (no clinic_id)
  IF NEW.clinic_id IS NULL THEN
    INSERT INTO public.doctor_icd_codes (doctor_id, code, description)
    VALUES
      (NEW.id, 'A09', 'Infectious gastroenteritis and colitis'),
      (NEW.id, 'B34.9', 'Viral infection, unspecified'),
      (NEW.id, 'E11.9', 'Type 2 diabetes mellitus without complications'),
      (NEW.id, 'E78.5', 'Hyperlipidemia, unspecified'),
      (NEW.id, 'F32.9', 'Major depressive disorder, single episode'),
      (NEW.id, 'F41.9', 'Anxiety disorder, unspecified'),
      (NEW.id, 'G43.909', 'Migraine, unspecified'),
      (NEW.id, 'I10', 'Essential (primary) hypertension'),
      (NEW.id, 'I25.10', 'Atherosclerotic heart disease'),
      (NEW.id, 'I50.9', 'Heart failure, unspecified'),
      (NEW.id, 'J00', 'Acute nasopharyngitis (common cold)'),
      (NEW.id, 'J02.9', 'Acute pharyngitis, unspecified'),
      (NEW.id, 'J06.9', 'Acute upper respiratory infection'),
      (NEW.id, 'J18.9', 'Pneumonia, unspecified organism'),
      (NEW.id, 'J20.9', 'Acute bronchitis, unspecified'),
      (NEW.id, 'J30.9', 'Allergic rhinitis, unspecified'),
      (NEW.id, 'J45.909', 'Unspecified asthma'),
      (NEW.id, 'K21.0', 'Gastro-esophageal reflux disease with esophagitis'),
      (NEW.id, 'K29.70', 'Gastritis, unspecified'),
      (NEW.id, 'K30', 'Functional dyspepsia'),
      (NEW.id, 'K58.9', 'Irritable bowel syndrome'),
      (NEW.id, 'K59.00', 'Constipation, unspecified'),
      (NEW.id, 'L30.9', 'Dermatitis, unspecified'),
      (NEW.id, 'M25.50', 'Pain in unspecified joint'),
      (NEW.id, 'M54.5', 'Low back pain'),
      (NEW.id, 'M79.3', 'Panniculitis, unspecified'),
      (NEW.id, 'N39.0', 'Urinary tract infection'),
      (NEW.id, 'R05', 'Cough'),
      (NEW.id, 'R10.9', 'Unspecified abdominal pain'),
      (NEW.id, 'R11.2', 'Nausea with vomiting'),
      (NEW.id, 'R50.9', 'Fever, unspecified'),
      (NEW.id, 'R51', 'Headache'),
      (NEW.id, 'R53.83', 'Other fatigue'),
      (NEW.id, 'Z00.00', 'General adult medical examination'),
      (NEW.id, 'Z23', 'Encounter for immunization');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for single doctor signup
CREATE TRIGGER add_default_doctor_allergies_trigger
AFTER INSERT ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.add_default_doctor_allergies();

CREATE TRIGGER add_default_doctor_diseases_trigger
AFTER INSERT ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.add_default_doctor_diseases();

CREATE TRIGGER add_default_doctor_icd_codes_trigger
AFTER INSERT ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.add_default_doctor_icd_codes();