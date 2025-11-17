/*
  # Patient Management System Database Schema

  1. New Enums
    - `app_role` - User roles (admin, doctor, nurse, receptionist, patient)
    - `appointment_status` - Appointment statuses
    - `payment_status` - Payment statuses  
    - `gender` - Gender options
    - `waitlist_priority` - Waitlist priority levels
    - `waitlist_status` - Waitlist statuses

  2. New Tables
    - `profiles` - User profiles
    - `user_roles` - User role assignments
    - `patients` - Patient records
    - `doctors` - Doctor information
    - `appointments` - Appointment scheduling
    - `medical_records` - Patient medical records
    - `prescriptions` - Prescriptions
    - `medical_documents` - Document storage references
    - `invoices` - Billing information
    - `activity_logs` - System activity logging
    - `waitlist` - Appointment waitlist management

  3. Security
    - Enable RLS on all tables
    - Create comprehensive policies for each table
    - Add helper functions for role checking

  4. Performance
    - Add indexes for frequently queried columns
    - Add triggers for automatic timestamp updates
*/

-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'patient');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');
CREATE TYPE public.gender AS ENUM ('male', 'female', 'other');
CREATE TYPE public.waitlist_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.waitlist_status AS ENUM ('waiting', 'contacted', 'scheduled', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  gender public.gender,
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  gender public.gender NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  allergies TEXT,
  medical_history TEXT,
  qr_code TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER,
  consultation_fee DECIMAL(10,2),
  license_number TEXT,
  available_days TEXT[],
  available_hours TEXT,
  introduction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status public.appointment_status DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  diagnosis TEXT,
  symptoms TEXT,
  vital_signs JSONB,
  test_results TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medical_documents table
CREATE TABLE public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status public.payment_status DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  reason TEXT NOT NULL,
  priority public.waitlist_priority DEFAULT 'medium',
  status public.waitlist_status DEFAULT 'waiting',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own doctor role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'doctor');

-- RLS Policies for patients
CREATE POLICY "Staff can view all patients" ON public.patients FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can insert patients" ON public.patients FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can update patients" ON public.patients FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Admins can delete patients" ON public.patients FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for doctors
CREATE POLICY "Everyone can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own doctor profile" ON public.doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments" ON public.appointments FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can create appointments" ON public.appointments FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can update appointments" ON public.appointments FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_records
CREATE POLICY "Medical staff can view records" ON public.medical_records FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "Doctors can create records" ON public.medical_records FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor')
);
CREATE POLICY "Doctors can update records" ON public.medical_records FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor')
);

-- RLS Policies for prescriptions
CREATE POLICY "Medical staff can view prescriptions" ON public.prescriptions FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse')
);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor')
);

-- RLS Policies for medical_documents
CREATE POLICY "Staff can view documents" ON public.medical_documents FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can upload documents" ON public.medical_documents FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'nurse') OR 
  public.has_role(auth.uid(), 'receptionist')
);

-- RLS Policies for invoices
CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can create invoices" ON public.invoices FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can update invoices" ON public.invoices FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all logs" ON public.activity_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for waitlist
CREATE POLICY "Staff can view waitlist" ON public.waitlist FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can create waitlist entries" ON public.waitlist FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Staff can update waitlist entries" ON public.waitlist FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'doctor') OR 
  public.has_role(auth.uid(), 'receptionist')
);
CREATE POLICY "Admins can delete waitlist entries" ON public.waitlist FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON public.waitlist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX idx_waitlist_patient ON public.waitlist(patient_id);
CREATE INDEX idx_waitlist_doctor ON public.waitlist(doctor_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_waitlist_priority ON public.waitlist(priority);
