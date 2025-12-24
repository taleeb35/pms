-- =====================================================
-- PERFORMANCE OPTIMIZATION MIGRATION
-- Indexes, function optimizations, and query improvements
-- =====================================================

-- 1. ADD INDEXES ON HIGH-TRAFFIC COLUMNS

-- Appointments table - most queried table
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON public.appointments(created_by);

-- Patients table
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);

-- Doctors table
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_approved ON public.doctors(approved);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_approved ON public.doctors(clinic_id, approved);

-- Visit records table
CREATE INDEX IF NOT EXISTS idx_visit_records_patient_id ON public.visit_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_visit_records_doctor_id ON public.visit_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visit_records_appointment_id ON public.visit_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_visit_records_visit_date ON public.visit_records(visit_date);

-- User roles table - critical for RLS performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles(user_id, role);

-- Clinic receptionists table
CREATE INDEX IF NOT EXISTS idx_clinic_receptionists_user_id ON public.clinic_receptionists(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_receptionists_clinic_id ON public.clinic_receptionists(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_receptionists_user_clinic ON public.clinic_receptionists(user_id, clinic_id);

-- Doctor schedules
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON public.doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_day ON public.doctor_schedules(doctor_id, day_of_week);

-- Doctor leaves
CREATE INDEX IF NOT EXISTS idx_doctor_leaves_doctor_id ON public.doctor_leaves(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_leaves_date ON public.doctor_leaves(leave_date);

-- Wait list
CREATE INDEX IF NOT EXISTS idx_wait_list_doctor_id ON public.wait_list(doctor_id);
CREATE INDEX IF NOT EXISTS idx_wait_list_patient_id ON public.wait_list(patient_id);
CREATE INDEX IF NOT EXISTS idx_wait_list_date ON public.wait_list(scheduled_date);

-- Medical records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON public.medical_records(doctor_id);

-- Medical documents
CREATE INDEX IF NOT EXISTS idx_medical_documents_patient_id ON public.medical_documents(patient_id);

-- Prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);

-- Clinic expenses
CREATE INDEX IF NOT EXISTS idx_clinic_expenses_clinic_id ON public.clinic_expenses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_expenses_date ON public.clinic_expenses(expense_date);

-- Support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_doctor_id ON public.support_tickets(doctor_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_clinic_id ON public.support_tickets(clinic_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- Clinic payments
CREATE INDEX IF NOT EXISTS idx_clinic_payments_clinic_id ON public.clinic_payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_payments_month ON public.clinic_payments(month);

-- Doctor payments
CREATE INDEX IF NOT EXISTS idx_doctor_payments_doctor_id ON public.doctor_payments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_payments_month ON public.doctor_payments(month);

-- Templates
CREATE INDEX IF NOT EXISTS idx_doctor_disease_templates_doctor_id ON public.doctor_disease_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_test_templates_doctor_id ON public.doctor_test_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_report_templates_doctor_id ON public.doctor_report_templates(doctor_id);

-- Procedures
CREATE INDEX IF NOT EXISTS idx_procedures_doctor_id ON public.procedures(doctor_id);

-- Clinic-level tables
CREATE INDEX IF NOT EXISTS idx_clinic_allergies_clinic_id ON public.clinic_allergies(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_diseases_clinic_id ON public.clinic_diseases(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_icd_codes_clinic_id ON public.clinic_icd_codes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_specializations_clinic_id ON public.specializations(clinic_id);

-- 2. OPTIMIZE RLS HELPER FUNCTIONS

-- Optimized has_role function with better caching
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id 
      AND ur.role = _role
      AND (
        _role != 'doctor' 
        OR EXISTS (
          SELECT 1 FROM public.doctors d 
          WHERE d.id = _user_id AND d.approved = true
        )
      )
  )
$$;

-- Optimized is_clinic_active function
CREATE OR REPLACE FUNCTION public.is_clinic_active(_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinics
    WHERE id = _clinic_id
      AND status = 'active'
  )
$$;

-- 3. ADD HELPER FUNCTION FOR COMMON RLS PATTERNS

-- Function to check if user is a receptionist for a clinic
CREATE OR REPLACE FUNCTION public.is_receptionist_of_clinic(_user_id uuid, _clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_receptionists cr
    WHERE cr.user_id = _user_id
      AND cr.clinic_id = _clinic_id
      AND cr.status = 'active'
  )
$$;

-- Function to get user's clinic_id if they are a doctor
CREATE OR REPLACE FUNCTION public.get_doctor_clinic_id(_doctor_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id
  FROM public.doctors
  WHERE id = _doctor_id
    AND approved = true
  LIMIT 1
$$;

-- Function to get receptionist's clinic_id
CREATE OR REPLACE FUNCTION public.get_receptionist_clinic_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT clinic_id
  FROM public.clinic_receptionists
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;

-- 4. ANALYZE TABLES TO UPDATE STATISTICS
-- This helps the query planner make better decisions
ANALYZE public.appointments;
ANALYZE public.patients;
ANALYZE public.doctors;
ANALYZE public.user_roles;
ANALYZE public.clinic_receptionists;
ANALYZE public.visit_records;
ANALYZE public.clinics;