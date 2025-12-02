-- Ensure cascade deletion for clinic -> doctors -> patients

-- First, drop existing foreign key constraints if they exist
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_clinic_id_fkey;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_created_by_fkey;

-- Add proper cascade deletion for doctors when clinic is deleted
ALTER TABLE doctors
ADD CONSTRAINT doctors_clinic_id_fkey
FOREIGN KEY (clinic_id)
REFERENCES clinics(id)
ON DELETE CASCADE;

-- Add proper cascade deletion for patients when doctor (creator) is deleted
ALTER TABLE patients
ADD CONSTRAINT patients_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Also ensure appointments are cleaned up when patient or doctor is deleted
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE appointments
ADD CONSTRAINT appointments_doctor_id_fkey
FOREIGN KEY (doctor_id)
REFERENCES doctors(id)
ON DELETE CASCADE;