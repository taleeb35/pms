-- Function to add default ICD codes for new clinics
CREATE OR REPLACE FUNCTION public.add_default_icd_codes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.clinic_icd_codes (clinic_id, code, description)
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
  
  RETURN NEW;
END;
$function$;

-- Create trigger for default ICD codes
CREATE TRIGGER add_clinic_default_icd_codes
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.add_default_icd_codes();