-- Clinic medicines
CREATE TABLE public.clinic_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, name)
);
CREATE INDEX idx_clinic_medicines_clinic ON public.clinic_medicines(clinic_id);
ALTER TABLE public.clinic_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinics manage own medicines" ON public.clinic_medicines
  FOR ALL USING (auth.uid() = clinic_id) WITH CHECK (auth.uid() = clinic_id);
CREATE POLICY "Clinic staff view medicines" ON public.clinic_medicines
  FOR SELECT USING (
    auth.uid() = clinic_id
    OR public.is_receptionist_of_clinic(auth.uid(), clinic_id)
    OR EXISTS (SELECT 1 FROM public.doctors WHERE id = auth.uid() AND clinic_id = clinic_medicines.clinic_id AND approved = true)
  );
CREATE POLICY "Receptionists manage clinic medicines" ON public.clinic_medicines
  FOR ALL USING (public.is_receptionist_of_clinic(auth.uid(), clinic_id))
  WITH CHECK (public.is_receptionist_of_clinic(auth.uid(), clinic_id));
CREATE POLICY "Admins manage all clinic medicines" ON public.clinic_medicines
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Doctor medicines (single doctors)
CREATE TABLE public.doctor_medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, name)
);
CREATE INDEX idx_doctor_medicines_doctor ON public.doctor_medicines(doctor_id);
ALTER TABLE public.doctor_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own medicines" ON public.doctor_medicines
  FOR ALL USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctor receptionists view medicines" ON public.doctor_medicines
  FOR SELECT USING (public.is_doctor_receptionist(auth.uid(), doctor_id));
CREATE POLICY "Doctor receptionists manage medicines" ON public.doctor_medicines
  FOR ALL USING (public.is_doctor_receptionist(auth.uid(), doctor_id))
  WITH CHECK (public.is_doctor_receptionist(auth.uid(), doctor_id));
CREATE POLICY "Admins manage all doctor medicines" ON public.doctor_medicines
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Helper to seed values via a temp table approach (simpler, avoids huge functions)
-- Seed: backfill existing clinics
WITH med(name) AS (
  VALUES
  ('Panadol'),('Panadol Extra'),('Calpol'),('Disprin'),('Brufen'),('Brufen 400'),('Nuberol'),('Nuberol Forte'),
  ('Ponstan'),('Ponstan Forte'),('Naprosyn'),('Voltral'),('Voltral Emulgel'),('Diclofenac Sodium'),('Tramal'),
  ('Toradol'),('Ketorolac'),('Norgesic'),('Celebrex'),('Arcoxia'),('Mobic'),('Augmentin'),('Augmentin 625'),
  ('Augmentin DS Syp'),('Amoxil'),('Hiconcil'),('Velosef'),('Cephradine'),('Keflex'),('Cefspan'),('Suprax'),
  ('Cefixime'),('Cefim'),('Rocephin'),('Ceftriaxone'),('Klaricid'),('Klacid'),('Erythrocin'),('Zithromax'),
  ('Azomax'),('Azithromycin'),('Ciproxin'),('Cifran'),('Ciprofloxacin'),('Tavanic'),('Levofloxacin'),('Avelox'),
  ('Moxifloxacin'),('Septran'),('Septran DS'),('Flagyl'),('Flagyl Syp'),('Metronidazole'),('Tinidazole'),('Fasigyn'),
  ('Doxycycline'),('Vibramycin'),('Nitazoxanide'),('Nizonide'),('Risek'),('Risek 20'),('Nexum'),('Esso'),
  ('Esomeprazole'),('Pantonix'),('Controloc'),('Pantoprazole'),('Zantac'),('Ranitidine'),('Famotidine'),('Mucaine'),
  ('Mucaine Syp'),('Gaviscon'),('Eno'),('Lactulose'),('Duphalac'),('Imodium'),('Loperamide'),('Smecta'),
  ('Maxolon'),('Metoclopramide'),('Motilium'),('Domperidone'),('Stemetil'),('Buscopan'),('Hyoscine'),('Mebeverine'),
  ('Colofac'),('Librax'),('Bentyl'),('Polybion'),('Surbex Z'),('Centrum'),('Becosules'),('Neurobion'),
  ('Methycobal'),('Folic Acid'),('Conofer'),('Ferrosanol'),('Sangobion'),('Ferofol'),('Calcimax'),('Caltrate'),
  ('Osteocare'),('Vitamin D3'),('Sustanon'),('Decadron'),('Solu Medrol'),('Deltacortril'),('Prednisolone'),
  ('Prednol'),('Hydrocortisone'),('Loprin'),('Ecosprin'),('Aspirin'),('Plavix'),('Clopidogrel'),('Coumadin'),
  ('Warfarin'),('Eliquis'),('Xarelto'),('Heparin'),('Clexane'),('Lovenox'),('Inderal'),('Propranolol'),
  ('Tenormin'),('Atenolol'),('Concor'),('Bisoprolol'),('Carvedilol'),('Cardace'),('Ramipril'),('Coversyl'),
  ('Perindopril'),('Capoten'),('Captopril'),('Renitec'),('Enalapril'),('Norvasc'),('Amlong'),('Amlodipine'),
  ('Adalat'),('Nifedipine'),('Cardizem'),('Diltiazem'),('Diovan'),('Valsartan'),('Micardis'),('Telmisartan'),
  ('Olmetec'),('Olmesartan'),('Cozaar'),('Losartan'),('Lasix'),('Furosemide'),('Aldactone'),('Spironolactone'),
  ('Hydrochlorothiazide'),('Lipitor'),('Atorvastatin'),('Rosuvas'),('Rosuvastatin'),('Crestor'),('Simvastatin'),
  ('Lipiget'),('Fenofibrate'),('Trilipix'),('Glucophage'),('Metformin'),('Diamicron'),('Gliclazide'),('Amaryl'),
  ('Glimepiride'),('Daonil'),('Glibenclamide'),('Januvia'),('Sitagliptin'),('Galvus'),('Vildagliptin'),('Forxiga'),
  ('Dapagliflozin'),('Jardiance'),('Empagliflozin'),('Lantus'),('Levemir'),('Mixtard'),('Humalog'),('Novomix'),
  ('Insulatard'),('Eltroxin'),('Thyronorm'),('Levothyroxine'),('Carbimazole'),('Neo Mercazole'),('Salbutamol'),
  ('Ventolin'),('Ventolin Inhaler'),('Asthalin'),('Inhaler Seretide'),('Symbicort'),('Berodual'),('Atrovent'),
  ('Combivent'),('Singulair'),('Montelukast'),('Theophylline'),('Polaramine'),('Avil'),('Telfast'),('Fexofenadine'),
  ('Claritin'),('Loratadine'),('Zyrtec'),('Cetirizine'),('Hismanal'),('Atarax'),('Hydroxyzine'),('Codis'),
  ('Hydrillin'),('Benadryl'),('Cough Syp Tixylix'),('Robitussin'),('Bromhexine'),('Mucolite'),('Mucosolvan'),
  ('Ambroxol'),('Bromex'),('Pyridium'),('Urex'),('Macrobid'),('Nitrofurantoin'),('Bactrim'),('Cipralex'),
  ('Lexapro'),('Prozac'),('Fluoxetine'),('Zoloft'),('Sertraline'),('Effexor'),('Venlafaxine'),('Cymbalta'),
  ('Duloxetine'),('Amitriptyline'),('Tryptanol'),('Mirtazapine'),('Stilnox'),('Xanax'),('Alprazolam'),('Lexotanil'),
  ('Bromazepam'),('Ativan'),('Lorazepam'),('Valium'),('Diazepam'),('Tegral'),('Tegretol'),('Carbamazepine'),
  ('Depakine'),('Valproate'),('Keppra'),('Levetiracetam'),('Lamictal'),('Lamotrigine'),('Topamax'),('Topiramate'),
  ('Neurontin'),('Gabapentin'),('Lyrica'),('Pregabalin'),('Maxgalin'),('Sifrol'),('Pramipexole'),('Madopar'),
  ('Symmetrel'),('Aricept'),('Donepezil'),('Exelon'),('Rivastigmine'),('Ebixa'),('Memantine'),('Fucidin Cream'),
  ('Daktarin'),('Lamisil'),('Canesten'),('Quadriderm'),('Betnovate'),('Locoid'),('Elocon'),('Calamine Lotion'),
  ('Pred Forte'),('Tobrex'),('Maxitrol'),('Decadron Eye Drops'),('Refresh Tears'),('Tears Naturale'),('Xalatan'),
  ('Lumigan'),('Cosopt'),('Travatan'),('Otosporin'),('Sofradex'),('Auralgan'),('Otrivin'),('Otrivin Paed'),
  ('Nasivion'),('Coldex'),('Coldrex'),('Actifed'),('Disprin Plus'),('Paracetamol Inj'),('Pethidine Inj'),
  ('Morphine Inj'),('Tetanus Toxoid'),('Diphenhydramine'),('Promethazine'),('Phenergan')
)
INSERT INTO public.clinic_medicines (clinic_id, name)
SELECT c.id, m.name FROM public.clinics c CROSS JOIN med m
ON CONFLICT (clinic_id, name) DO NOTHING;

-- Backfill existing single doctors
WITH med(name) AS (
  VALUES
  ('Panadol'),('Panadol Extra'),('Calpol'),('Disprin'),('Brufen'),('Brufen 400'),('Nuberol'),('Nuberol Forte'),
  ('Ponstan'),('Ponstan Forte'),('Naprosyn'),('Voltral'),('Voltral Emulgel'),('Diclofenac Sodium'),('Tramal'),
  ('Toradol'),('Ketorolac'),('Norgesic'),('Celebrex'),('Arcoxia'),('Mobic'),('Augmentin'),('Augmentin 625'),
  ('Augmentin DS Syp'),('Amoxil'),('Hiconcil'),('Velosef'),('Cephradine'),('Keflex'),('Cefspan'),('Suprax'),
  ('Cefixime'),('Cefim'),('Rocephin'),('Ceftriaxone'),('Klaricid'),('Klacid'),('Erythrocin'),('Zithromax'),
  ('Azomax'),('Azithromycin'),('Ciproxin'),('Cifran'),('Ciprofloxacin'),('Tavanic'),('Levofloxacin'),('Avelox'),
  ('Moxifloxacin'),('Septran'),('Septran DS'),('Flagyl'),('Flagyl Syp'),('Metronidazole'),('Tinidazole'),('Fasigyn'),
  ('Doxycycline'),('Vibramycin'),('Nitazoxanide'),('Nizonide'),('Risek'),('Risek 20'),('Nexum'),('Esso'),
  ('Esomeprazole'),('Pantonix'),('Controloc'),('Pantoprazole'),('Zantac'),('Ranitidine'),('Famotidine'),('Mucaine'),
  ('Mucaine Syp'),('Gaviscon'),('Eno'),('Lactulose'),('Duphalac'),('Imodium'),('Loperamide'),('Smecta'),
  ('Maxolon'),('Metoclopramide'),('Motilium'),('Domperidone'),('Stemetil'),('Buscopan'),('Hyoscine'),('Mebeverine'),
  ('Colofac'),('Librax'),('Bentyl'),('Polybion'),('Surbex Z'),('Centrum'),('Becosules'),('Neurobion'),
  ('Methycobal'),('Folic Acid'),('Conofer'),('Ferrosanol'),('Sangobion'),('Ferofol'),('Calcimax'),('Caltrate'),
  ('Osteocare'),('Vitamin D3'),('Sustanon'),('Decadron'),('Solu Medrol'),('Deltacortril'),('Prednisolone'),
  ('Prednol'),('Hydrocortisone'),('Loprin'),('Ecosprin'),('Aspirin'),('Plavix'),('Clopidogrel'),('Coumadin'),
  ('Warfarin'),('Eliquis'),('Xarelto'),('Heparin'),('Clexane'),('Lovenox'),('Inderal'),('Propranolol'),
  ('Tenormin'),('Atenolol'),('Concor'),('Bisoprolol'),('Carvedilol'),('Cardace'),('Ramipril'),('Coversyl'),
  ('Perindopril'),('Capoten'),('Captopril'),('Renitec'),('Enalapril'),('Norvasc'),('Amlong'),('Amlodipine'),
  ('Adalat'),('Nifedipine'),('Cardizem'),('Diltiazem'),('Diovan'),('Valsartan'),('Micardis'),('Telmisartan'),
  ('Olmetec'),('Olmesartan'),('Cozaar'),('Losartan'),('Lasix'),('Furosemide'),('Aldactone'),('Spironolactone'),
  ('Hydrochlorothiazide'),('Lipitor'),('Atorvastatin'),('Rosuvas'),('Rosuvastatin'),('Crestor'),('Simvastatin'),
  ('Lipiget'),('Fenofibrate'),('Trilipix'),('Glucophage'),('Metformin'),('Diamicron'),('Gliclazide'),('Amaryl'),
  ('Glimepiride'),('Daonil'),('Glibenclamide'),('Januvia'),('Sitagliptin'),('Galvus'),('Vildagliptin'),('Forxiga'),
  ('Dapagliflozin'),('Jardiance'),('Empagliflozin'),('Lantus'),('Levemir'),('Mixtard'),('Humalog'),('Novomix'),
  ('Insulatard'),('Eltroxin'),('Thyronorm'),('Levothyroxine'),('Carbimazole'),('Neo Mercazole'),('Salbutamol'),
  ('Ventolin'),('Ventolin Inhaler'),('Asthalin'),('Inhaler Seretide'),('Symbicort'),('Berodual'),('Atrovent'),
  ('Combivent'),('Singulair'),('Montelukast'),('Theophylline'),('Polaramine'),('Avil'),('Telfast'),('Fexofenadine'),
  ('Claritin'),('Loratadine'),('Zyrtec'),('Cetirizine'),('Hismanal'),('Atarax'),('Hydroxyzine'),('Codis'),
  ('Hydrillin'),('Benadryl'),('Cough Syp Tixylix'),('Robitussin'),('Bromhexine'),('Mucolite'),('Mucosolvan'),
  ('Ambroxol'),('Bromex'),('Pyridium'),('Urex'),('Macrobid'),('Nitrofurantoin'),('Bactrim'),('Cipralex'),
  ('Lexapro'),('Prozac'),('Fluoxetine'),('Zoloft'),('Sertraline'),('Effexor'),('Venlafaxine'),('Cymbalta'),
  ('Duloxetine'),('Amitriptyline'),('Tryptanol'),('Mirtazapine'),('Stilnox'),('Xanax'),('Alprazolam'),('Lexotanil'),
  ('Bromazepam'),('Ativan'),('Lorazepam'),('Valium'),('Diazepam'),('Tegral'),('Tegretol'),('Carbamazepine'),
  ('Depakine'),('Valproate'),('Keppra'),('Levetiracetam'),('Lamictal'),('Lamotrigine'),('Topamax'),('Topiramate'),
  ('Neurontin'),('Gabapentin'),('Lyrica'),('Pregabalin'),('Maxgalin'),('Sifrol'),('Pramipexole'),('Madopar'),
  ('Symmetrel'),('Aricept'),('Donepezil'),('Exelon'),('Rivastigmine'),('Ebixa'),('Memantine'),('Fucidin Cream'),
  ('Daktarin'),('Lamisil'),('Canesten'),('Quadriderm'),('Betnovate'),('Locoid'),('Elocon'),('Calamine Lotion'),
  ('Pred Forte'),('Tobrex'),('Maxitrol'),('Decadron Eye Drops'),('Refresh Tears'),('Tears Naturale'),('Xalatan'),
  ('Lumigan'),('Cosopt'),('Travatan'),('Otosporin'),('Sofradex'),('Auralgan'),('Otrivin'),('Otrivin Paed'),
  ('Nasivion'),('Coldex'),('Coldrex'),('Actifed'),('Disprin Plus'),('Paracetamol Inj'),('Pethidine Inj'),
  ('Morphine Inj'),('Tetanus Toxoid'),('Diphenhydramine'),('Promethazine'),('Phenergan')
)
INSERT INTO public.doctor_medicines (doctor_id, name)
SELECT d.id, m.name FROM public.doctors d CROSS JOIN med m
WHERE d.clinic_id IS NULL
ON CONFLICT (doctor_id, name) DO NOTHING;

-- Triggers: seed for newly created clinics and single doctors using the same WITH med list
CREATE OR REPLACE FUNCTION public.add_default_medicines()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  INSERT INTO public.clinic_medicines (clinic_id, name)
  SELECT NEW.id, name FROM public.clinic_medicines WHERE clinic_id = (SELECT id FROM public.clinics WHERE id <> NEW.id ORDER BY created_at LIMIT 1)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Replace the trigger function with a static-seed version so seeding does not depend on other clinics existing
CREATE OR REPLACE FUNCTION public.add_default_medicines()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  med_name text;
  med_names text[] := ARRAY[
    'Panadol','Panadol Extra','Calpol','Disprin','Brufen','Brufen 400','Nuberol','Nuberol Forte',
    'Ponstan','Ponstan Forte','Naprosyn','Voltral','Voltral Emulgel','Diclofenac Sodium','Tramal',
    'Toradol','Ketorolac','Norgesic','Celebrex','Arcoxia','Mobic','Augmentin','Augmentin 625',
    'Augmentin DS Syp','Amoxil','Hiconcil','Velosef','Cephradine','Keflex','Cefspan','Suprax',
    'Cefixime','Cefim','Rocephin','Ceftriaxone','Klaricid','Klacid','Erythrocin','Zithromax',
    'Azomax','Azithromycin','Ciproxin','Cifran','Ciprofloxacin','Tavanic','Levofloxacin','Avelox',
    'Moxifloxacin','Septran','Septran DS','Flagyl','Flagyl Syp','Metronidazole','Tinidazole','Fasigyn',
    'Doxycycline','Vibramycin','Nitazoxanide','Nizonide','Risek','Risek 20','Nexum','Esso',
    'Esomeprazole','Pantonix','Controloc','Pantoprazole','Zantac','Ranitidine','Famotidine','Mucaine',
    'Mucaine Syp','Gaviscon','Eno','Lactulose','Duphalac','Imodium','Loperamide','Smecta',
    'Maxolon','Metoclopramide','Motilium','Domperidone','Stemetil','Buscopan','Hyoscine','Mebeverine',
    'Colofac','Librax','Bentyl','Polybion','Surbex Z','Centrum','Becosules','Neurobion',
    'Methycobal','Folic Acid','Conofer','Ferrosanol','Sangobion','Ferofol','Calcimax','Caltrate',
    'Osteocare','Vitamin D3','Sustanon','Decadron','Solu Medrol','Deltacortril','Prednisolone',
    'Prednol','Hydrocortisone','Loprin','Ecosprin','Aspirin','Plavix','Clopidogrel','Coumadin',
    'Warfarin','Eliquis','Xarelto','Heparin','Clexane','Lovenox','Inderal','Propranolol',
    'Tenormin','Atenolol','Concor','Bisoprolol','Carvedilol','Cardace','Ramipril','Coversyl',
    'Perindopril','Capoten','Captopril','Renitec','Enalapril','Norvasc','Amlong','Amlodipine',
    'Adalat','Nifedipine','Cardizem','Diltiazem','Diovan','Valsartan','Micardis','Telmisartan',
    'Olmetec','Olmesartan','Cozaar','Losartan','Lasix','Furosemide','Aldactone','Spironolactone',
    'Hydrochlorothiazide','Lipitor','Atorvastatin','Rosuvas','Rosuvastatin','Crestor','Simvastatin',
    'Lipiget','Fenofibrate','Trilipix','Glucophage','Metformin','Diamicron','Gliclazide','Amaryl',
    'Glimepiride','Daonil','Glibenclamide','Januvia','Sitagliptin','Galvus','Vildagliptin','Forxiga',
    'Dapagliflozin','Jardiance','Empagliflozin','Lantus','Levemir','Mixtard','Humalog','Novomix',
    'Insulatard','Eltroxin','Thyronorm','Levothyroxine','Carbimazole','Neo Mercazole','Salbutamol',
    'Ventolin','Ventolin Inhaler','Asthalin','Inhaler Seretide','Symbicort','Berodual','Atrovent',
    'Combivent','Singulair','Montelukast','Theophylline','Polaramine','Avil','Telfast','Fexofenadine',
    'Claritin','Loratadine','Zyrtec','Cetirizine','Hismanal','Atarax','Hydroxyzine','Codis',
    'Hydrillin','Benadryl','Cough Syp Tixylix','Robitussin','Bromhexine','Mucolite','Mucosolvan',
    'Ambroxol','Bromex','Pyridium','Urex','Macrobid','Nitrofurantoin','Bactrim','Cipralex',
    'Lexapro','Prozac','Fluoxetine','Zoloft','Sertraline','Effexor','Venlafaxine','Cymbalta',
    'Duloxetine','Amitriptyline','Tryptanol','Mirtazapine','Stilnox','Xanax','Alprazolam','Lexotanil',
    'Bromazepam','Ativan','Lorazepam','Valium','Diazepam','Tegral','Tegretol','Carbamazepine',
    'Depakine','Valproate','Keppra','Levetiracetam','Lamictal','Lamotrigine','Topamax','Topiramate',
    'Neurontin','Gabapentin','Lyrica','Pregabalin','Maxgalin','Sifrol','Pramipexole','Madopar',
    'Symmetrel','Aricept','Donepezil','Exelon','Rivastigmine','Ebixa','Memantine','Fucidin Cream',
    'Daktarin','Lamisil','Canesten','Quadriderm','Betnovate','Locoid','Elocon','Calamine Lotion',
    'Pred Forte','Tobrex','Maxitrol','Decadron Eye Drops','Refresh Tears','Tears Naturale','Xalatan',
    'Lumigan','Cosopt','Travatan','Otosporin','Sofradex','Auralgan','Otrivin','Otrivin Paed',
    'Nasivion','Coldex','Coldrex','Actifed','Disprin Plus','Paracetamol Inj','Pethidine Inj',
    'Morphine Inj','Tetanus Toxoid','Diphenhydramine','Promethazine','Phenergan'
  ];
BEGIN
  FOREACH med_name IN ARRAY med_names LOOP
    INSERT INTO public.clinic_medicines (clinic_id, name) VALUES (NEW.id, med_name)
    ON CONFLICT (clinic_id, name) DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_add_default_medicines
AFTER INSERT ON public.clinics
FOR EACH ROW EXECUTE FUNCTION public.add_default_medicines();

CREATE OR REPLACE FUNCTION public.add_default_doctor_medicines()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  med_name text;
  med_names text[] := ARRAY[
    'Panadol','Panadol Extra','Calpol','Disprin','Brufen','Brufen 400','Nuberol','Nuberol Forte',
    'Ponstan','Ponstan Forte','Naprosyn','Voltral','Voltral Emulgel','Diclofenac Sodium','Tramal',
    'Toradol','Ketorolac','Norgesic','Celebrex','Arcoxia','Mobic','Augmentin','Augmentin 625',
    'Augmentin DS Syp','Amoxil','Hiconcil','Velosef','Cephradine','Keflex','Cefspan','Suprax',
    'Cefixime','Cefim','Rocephin','Ceftriaxone','Klaricid','Klacid','Erythrocin','Zithromax',
    'Azomax','Azithromycin','Ciproxin','Cifran','Ciprofloxacin','Tavanic','Levofloxacin','Avelox',
    'Moxifloxacin','Septran','Septran DS','Flagyl','Flagyl Syp','Metronidazole','Tinidazole','Fasigyn',
    'Doxycycline','Vibramycin','Nitazoxanide','Nizonide','Risek','Risek 20','Nexum','Esso',
    'Esomeprazole','Pantonix','Controloc','Pantoprazole','Zantac','Ranitidine','Famotidine','Mucaine',
    'Mucaine Syp','Gaviscon','Eno','Lactulose','Duphalac','Imodium','Loperamide','Smecta',
    'Maxolon','Metoclopramide','Motilium','Domperidone','Stemetil','Buscopan','Hyoscine','Mebeverine',
    'Colofac','Librax','Bentyl','Polybion','Surbex Z','Centrum','Becosules','Neurobion',
    'Methycobal','Folic Acid','Conofer','Ferrosanol','Sangobion','Ferofol','Calcimax','Caltrate',
    'Osteocare','Vitamin D3','Sustanon','Decadron','Solu Medrol','Deltacortril','Prednisolone',
    'Prednol','Hydrocortisone','Loprin','Ecosprin','Aspirin','Plavix','Clopidogrel','Coumadin',
    'Warfarin','Eliquis','Xarelto','Heparin','Clexane','Lovenox','Inderal','Propranolol',
    'Tenormin','Atenolol','Concor','Bisoprolol','Carvedilol','Cardace','Ramipril','Coversyl',
    'Perindopril','Capoten','Captopril','Renitec','Enalapril','Norvasc','Amlong','Amlodipine',
    'Adalat','Nifedipine','Cardizem','Diltiazem','Diovan','Valsartan','Micardis','Telmisartan',
    'Olmetec','Olmesartan','Cozaar','Losartan','Lasix','Furosemide','Aldactone','Spironolactone',
    'Hydrochlorothiazide','Lipitor','Atorvastatin','Rosuvas','Rosuvastatin','Crestor','Simvastatin',
    'Lipiget','Fenofibrate','Trilipix','Glucophage','Metformin','Diamicron','Gliclazide','Amaryl',
    'Glimepiride','Daonil','Glibenclamide','Januvia','Sitagliptin','Galvus','Vildagliptin','Forxiga',
    'Dapagliflozin','Jardiance','Empagliflozin','Lantus','Levemir','Mixtard','Humalog','Novomix',
    'Insulatard','Eltroxin','Thyronorm','Levothyroxine','Carbimazole','Neo Mercazole','Salbutamol',
    'Ventolin','Ventolin Inhaler','Asthalin','Inhaler Seretide','Symbicort','Berodual','Atrovent',
    'Combivent','Singulair','Montelukast','Theophylline','Polaramine','Avil','Telfast','Fexofenadine',
    'Claritin','Loratadine','Zyrtec','Cetirizine','Hismanal','Atarax','Hydroxyzine','Codis',
    'Hydrillin','Benadryl','Cough Syp Tixylix','Robitussin','Bromhexine','Mucolite','Mucosolvan',
    'Ambroxol','Bromex','Pyridium','Urex','Macrobid','Nitrofurantoin','Bactrim','Cipralex',
    'Lexapro','Prozac','Fluoxetine','Zoloft','Sertraline','Effexor','Venlafaxine','Cymbalta',
    'Duloxetine','Amitriptyline','Tryptanol','Mirtazapine','Stilnox','Xanax','Alprazolam','Lexotanil',
    'Bromazepam','Ativan','Lorazepam','Valium','Diazepam','Tegral','Tegretol','Carbamazepine',
    'Depakine','Valproate','Keppra','Levetiracetam','Lamictal','Lamotrigine','Topamax','Topiramate',
    'Neurontin','Gabapentin','Lyrica','Pregabalin','Maxgalin','Sifrol','Pramipexole','Madopar',
    'Symmetrel','Aricept','Donepezil','Exelon','Rivastigmine','Ebixa','Memantine','Fucidin Cream',
    'Daktarin','Lamisil','Canesten','Quadriderm','Betnovate','Locoid','Elocon','Calamine Lotion',
    'Pred Forte','Tobrex','Maxitrol','Decadron Eye Drops','Refresh Tears','Tears Naturale','Xalatan',
    'Lumigan','Cosopt','Travatan','Otosporin','Sofradex','Auralgan','Otrivin','Otrivin Paed',
    'Nasivion','Coldex','Coldrex','Actifed','Disprin Plus','Paracetamol Inj','Pethidine Inj',
    'Morphine Inj','Tetanus Toxoid','Diphenhydramine','Promethazine','Phenergan'
  ];
BEGIN
  IF NEW.clinic_id IS NULL THEN
    FOREACH med_name IN ARRAY med_names LOOP
      INSERT INTO public.doctor_medicines (doctor_id, name) VALUES (NEW.id, med_name)
      ON CONFLICT (doctor_id, name) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_add_default_doctor_medicines
AFTER INSERT ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.add_default_doctor_medicines();