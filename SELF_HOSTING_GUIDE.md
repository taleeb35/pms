# Zonoir Self-Hosting Guide

This guide provides **two hosting options** for setting up Zonoir on your own server.

---

## 📋 Choose Your Hosting Method

| Feature | Option A: Supabase (Cloud) | Option B: MySQL + cPanel (Traditional) |
|---------|---------------------------|----------------------------------------|
| **Best For** | Modern hosting, real-time features | Shared hosting, familiar tools |
| **Database** | PostgreSQL (managed) | MySQL/MariaDB (phpMyAdmin) |
| **File Storage** | Built-in cloud storage | Server file system |
| **Cost** | Free tier available | Depends on hosting ($3-10/month) |
| **Difficulty** | Easy | Medium |

---

# 🔵 OPTION A: Supabase Hosting (Recommended)

## Prerequisites
- Node.js 18+ installed
- A domain name (optional but recommended)
- A Supabase account (free tier available)

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Choose your organization and set:
   - **Project name**: `zonoir` (or your preferred name)
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIs...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIs...` (keep this secret!)

## Step 3: Set Up Database

Contact support for the complete database schema SQL file, then run it in the SQL Editor.

## Step 4: Deploy

Follow the VPS or Vercel deployment steps in the detailed section below.

---

# 🟢 OPTION B: MySQL + cPanel/phpMyAdmin (Traditional Hosting)

This option is for users who prefer traditional shared hosting with MySQL and phpMyAdmin.

---

## 📋 Prerequisites

- Shared hosting with cPanel (e.g., Hostinger, Bluehost, GoDaddy, Namecheap)
- PHP 8.0+ (for phpMyAdmin)
- MySQL 8.0+ or MariaDB 10.5+
- Node.js hosting support OR static file hosting
- Git access or FTP

---

## 🚀 Step 1: Download the Code

### Method A: Clone from GitHub
```bash
git clone https://github.com/your-username/zonoir.git
cd zonoir
```

### Method B: Download ZIP
1. Go to your GitHub repository
2. Click **Code → Download ZIP**
3. Extract to your local computer

---

## 🗄️ Step 2: Create MySQL Database

### Using cPanel:
1. Login to your **cPanel**
2. Go to **MySQL® Databases**
3. Create a new database:
   - **Database name**: `zonoir_db`
4. Create a new user:
   - **Username**: `zonoir_user`
   - **Password**: Create a strong password (save it!)
5. Add user to database with **ALL PRIVILEGES**

### Using phpMyAdmin:
1. Login to **phpMyAdmin**
2. Click **"New"** in the left sidebar
3. Enter database name: `zonoir_db`
4. Select **utf8mb4_unicode_ci** collation
5. Click **Create**

---

## 📊 Step 3: Import Database Schema

### Download Schema File

Save this SQL as `zonoir_schema.sql`:

```sql
-- =============================================
-- ZONOIR DATABASE SCHEMA FOR MySQL/MariaDB
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- =============================================
-- TABLE: users (Authentication)
-- =============================================
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email_verified` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: profiles
-- =============================================
CREATE TABLE `profiles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `avatar_url` TEXT,
  `address` TEXT,
  `city` VARCHAR(100),
  `gender` ENUM('male', 'female', 'other'),
  `date_of_birth` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: user_roles
-- =============================================
CREATE TABLE `user_roles` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `role` ENUM('admin', 'doctor', 'nurse', 'receptionist', 'patient', 'clinic') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinics
-- =============================================
CREATE TABLE `clinics` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_name` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `fee_status` VARCHAR(50) DEFAULT 'pending',
  `payment_plan` VARCHAR(50) DEFAULT 'monthly',
  `no_of_doctors` INT DEFAULT 0,
  `requested_doctors` INT DEFAULT 0,
  `trial_end_date` DATE,
  `referred_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctors
-- =============================================
CREATE TABLE `doctors` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36),
  `specialization` VARCHAR(255) NOT NULL,
  `qualification` VARCHAR(255) NOT NULL,
  `experience_years` INT,
  `consultation_fee` DECIMAL(10,2),
  `license_number` VARCHAR(100),
  `pmdc_number` VARCHAR(100),
  `contact_number` VARCHAR(50),
  `city` VARCHAR(100),
  `introduction` TEXT,
  `approved` TINYINT(1) DEFAULT 0,
  `payment_plan` VARCHAR(50) DEFAULT 'monthly',
  `clinic_percentage` DECIMAL(5,2),
  `trial_end_date` DATE,
  `referred_by` VARCHAR(36),
  `available_days` JSON,
  `available_hours` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: patients
-- =============================================
CREATE TABLE `patients` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `father_name` VARCHAR(255),
  `date_of_birth` DATE NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255),
  `cnic` VARCHAR(20),
  `address` TEXT,
  `city` VARCHAR(100),
  `blood_group` VARCHAR(10),
  `marital_status` VARCHAR(50),
  `allergies` TEXT,
  `major_diseases` TEXT,
  `medical_history` TEXT,
  `pregnancy_start_date` DATE,
  `emergency_contact_name` VARCHAR(255),
  `emergency_contact_phone` VARCHAR(50),
  `qr_code` TEXT,
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: appointments
-- =============================================
CREATE TABLE `appointments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(36) NOT NULL,
  `doctor_id` VARCHAR(36) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` TIME NOT NULL,
  `appointment_type` VARCHAR(50),
  `duration_minutes` INT DEFAULT 30,
  `status` ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
  `reason` TEXT,
  `notes` TEXT,
  `confidential_notes` TEXT,
  `consultation_fee` DECIMAL(10,2),
  `procedure_fee` DECIMAL(10,2),
  `other_fee` DECIMAL(10,2),
  `total_fee` DECIMAL(10,2),
  `refund` DECIMAL(10,2),
  `procedure_id` VARCHAR(36),
  `icd_code_id` VARCHAR(36),
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: visit_records
-- =============================================
CREATE TABLE `visit_records` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(36) NOT NULL,
  `doctor_id` VARCHAR(36) NOT NULL,
  `appointment_id` VARCHAR(36),
  `visit_date` DATE NOT NULL,
  `chief_complaint` TEXT,
  `patient_history` TEXT,
  `current_prescription` TEXT,
  `test_reports` TEXT,
  `next_visit_date` DATE,
  `next_visit_notes` TEXT,
  `weight` VARCHAR(20),
  `height` VARCHAR(20),
  `blood_pressure` VARCHAR(20),
  `pulse` VARCHAR(20),
  `temperature` VARCHAR(20),
  `pain_scale` INT,
  `right_eye_vision` VARCHAR(20),
  `left_eye_vision` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: medical_records
-- =============================================
CREATE TABLE `medical_records` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(36) NOT NULL,
  `doctor_id` VARCHAR(36) NOT NULL,
  `visit_date` DATE NOT NULL,
  `diagnosis` TEXT,
  `symptoms` TEXT,
  `notes` TEXT,
  `test_results` TEXT,
  `vital_signs` JSON,
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: prescriptions
-- =============================================
CREATE TABLE `prescriptions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `medical_record_id` VARCHAR(36) NOT NULL,
  `patient_id` VARCHAR(36) NOT NULL,
  `doctor_id` VARCHAR(36) NOT NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `instructions` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: medical_documents
-- =============================================
CREATE TABLE `medical_documents` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(36) NOT NULL,
  `medical_record_id` VARCHAR(36),
  `document_name` VARCHAR(255) NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `document_url` TEXT NOT NULL,
  `uploaded_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`uploaded_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: procedures
-- =============================================
CREATE TABLE `procedures` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_schedules
-- =============================================
CREATE TABLE `doctor_schedules` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `day_of_week` INT NOT NULL,
  `start_time` TIME,
  `end_time` TIME,
  `break_start` TIME,
  `break_end` TIME,
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_leaves
-- =============================================
CREATE TABLE `doctor_leaves` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `leave_date` DATE NOT NULL,
  `leave_type` VARCHAR(50) DEFAULT 'full_day',
  `reason` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_receptionists
-- =============================================
CREATE TABLE `clinic_receptionists` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_receptionists
-- =============================================
CREATE TABLE `doctor_receptionists` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: invoices
-- =============================================
CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` VARCHAR(36) NOT NULL,
  `appointment_id` VARCHAR(36),
  `amount` DECIMAL(10,2) NOT NULL,
  `tax` DECIMAL(10,2) DEFAULT 0,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_status` ENUM('pending', 'paid', 'partial', 'cancelled') DEFAULT 'pending',
  `payment_method` VARCHAR(50),
  `payment_date` DATE,
  `notes` TEXT,
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_expenses
-- =============================================
CREATE TABLE `clinic_expenses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0,
  `description` TEXT,
  `expense_date` DATE NOT NULL,
  `created_by` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `profiles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_payments
-- =============================================
CREATE TABLE `clinic_payments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `month` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0,
  `doctor_count` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'pending',
  `payment_date` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_payments
-- =============================================
CREATE TABLE `doctor_payments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `month` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'pending',
  `payment_date` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: activity_logs
-- =============================================
CREATE TABLE `activity_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(36),
  `details` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: wait_list
-- =============================================
CREATE TABLE `wait_list` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `patient_id` VARCHAR(36) NOT NULL,
  `doctor_id` VARCHAR(36) NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'waiting',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: support_tickets
-- =============================================
CREATE TABLE `support_tickets` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'open',
  `doctor_id` VARCHAR(36),
  `clinic_id` VARCHAR(36),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: ticket_messages
-- =============================================
CREATE TABLE `ticket_messages` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `ticket_id` VARCHAR(36) NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `sender_role` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: referral_partners
-- =============================================
CREATE TABLE `referral_partners` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `referral_code` VARCHAR(50) NOT NULL UNIQUE,
  `commission_rate` DECIMAL(5,2) DEFAULT 10,
  `total_referrals` INT DEFAULT 0,
  `total_earnings` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: referral_commissions
-- =============================================
CREATE TABLE `referral_commissions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `referral_partner_id` VARCHAR(36) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `doctor_id` VARCHAR(36),
  `doctor_name` VARCHAR(255),
  `doctor_email` VARCHAR(255),
  `clinic_id` VARCHAR(36),
  `clinic_name` VARCHAR(255),
  `clinic_email` VARCHAR(255),
  `month` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'pending',
  `paid_at` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`referral_partner_id`) REFERENCES `referral_partners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: specializations
-- =============================================
CREATE TABLE `specializations` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_allergies
-- =============================================
CREATE TABLE `clinic_allergies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_diseases
-- =============================================
CREATE TABLE `clinic_diseases` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinic_icd_codes
-- =============================================
CREATE TABLE `clinic_icd_codes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `clinic_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_allergies
-- =============================================
CREATE TABLE `doctor_allergies` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_diseases
-- =============================================
CREATE TABLE `doctor_diseases` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_icd_codes
-- =============================================
CREATE TABLE `doctor_icd_codes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_disease_templates
-- =============================================
CREATE TABLE `doctor_disease_templates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36),
  `clinic_id` VARCHAR(36),
  `disease_name` VARCHAR(255) NOT NULL,
  `prescription_template` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_test_templates
-- =============================================
CREATE TABLE `doctor_test_templates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36),
  `clinic_id` VARCHAR(36),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_report_templates
-- =============================================
CREATE TABLE `doctor_report_templates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36),
  `clinic_id` VARCHAR(36),
  `template_name` VARCHAR(255) NOT NULL,
  `fields` JSON DEFAULT '[]',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_sick_leave_templates
-- =============================================
CREATE TABLE `doctor_sick_leave_templates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `template_name` VARCHAR(255) NOT NULL,
  `template_content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: doctor_work_leave_templates
-- =============================================
CREATE TABLE `doctor_work_leave_templates` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `doctor_id` VARCHAR(36) NOT NULL,
  `template_name` VARCHAR(255) NOT NULL,
  `template_content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: system_settings
-- =============================================
CREATE TABLE `system_settings` (
  `key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_name ON patients(full_name);
CREATE INDEX idx_visit_records_patient ON visit_records(patient_id);
CREATE INDEX idx_visit_records_doctor ON visit_records(doctor_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);

COMMIT;
```

### Import Using phpMyAdmin:

1. Open **phpMyAdmin**
2. Select your database (`zonoir_db`)
3. Click **Import** tab
4. Click **Choose File** and select `zonoir_schema.sql`
5. Click **Go** to execute

---

## ⚙️ Step 4: Create Backend API (PHP)

Since the frontend uses Supabase client, you need to create a PHP backend API.

### Create API Folder Structure

```
/public_html/
├── api/
│   ├── config.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── register.php
│   │   └── verify.php
│   ├── patients/
│   │   ├── index.php
│   │   ├── create.php
│   │   └── update.php
│   ├── appointments/
│   │   └── index.php
│   └── upload/
│       └── index.php
├── uploads/
│   ├── avatars/
│   └── documents/
└── index.html (your React build)
```

### Create `api/config.php`:

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'zonoir_db');
define('DB_USER', 'zonoir_user');
define('DB_PASS', 'your_password_here');

// JWT Secret for authentication
define('JWT_SECRET', 'your-secret-key-change-this');

// Create database connection
function getDB() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
}

// Generate UUID
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Verify JWT token
function verifyToken() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    
    if (empty($auth) || !str_starts_with($auth, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    $token = substr($auth, 7);
    // Add JWT verification logic here
    // For simplicity, decode and verify the token
    
    return true;
}
?>
```

### Create `api/auth/login.php`:

```php
<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

$pdo = getDB();
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// Get profile and role
$stmt = $pdo->prepare("SELECT p.*, ur.role FROM profiles p 
    LEFT JOIN user_roles ur ON p.id = ur.user_id 
    WHERE p.id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

// Create simple token (use proper JWT in production)
$token = base64_encode(json_encode([
    'user_id' => $user['id'],
    'email' => $user['email'],
    'exp' => time() + 86400
]));

echo json_encode([
    'access_token' => $token,
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'user_metadata' => $profile
    ]
]);
?>
```

---

## 🔧 Step 5: Configure Frontend for MySQL API

You'll need to modify the Supabase client to use your PHP API instead.

### Create `src/lib/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const data = await this.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async signUp(email: string, password: string, userData: any) {
    return this.request('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...userData }),
    });
  }

  async signOut() {
    localStorage.removeItem('auth_token');
    this.token = null;
  }

  // Data methods
  async getPatients() {
    return this.request('/patients/');
  }

  async createPatient(data: any) {
    return this.request('/patients/create.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAppointments() {
    return this.request('/appointments/');
  }
}

export const api = new ApiClient();
```

### Update `.env`:

```env
VITE_API_URL=https://yourdomain.com/api
```

---

## 📁 Step 6: File Upload Setup

### Create upload directory:

```bash
mkdir -p public_html/uploads/avatars
mkdir -p public_html/uploads/documents
chmod 755 public_html/uploads
```

### Create `api/upload/index.php`:

```php
<?php
require_once '../config.php';
verifyToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$uploadDir = '../../uploads/';
$type = $_POST['type'] ?? 'documents';

if (!in_array($type, ['avatars', 'documents'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid upload type']);
    exit;
}

$targetDir = $uploadDir . $type . '/';

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$fileName = generateUUID() . '_' . basename($file['name']);
$targetPath = $targetDir . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $publicUrl = '/uploads/' . $type . '/' . $fileName;
    echo json_encode([
        'success' => true,
        'url' => $publicUrl,
        'name' => $fileName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Upload failed']);
}
?>
```

---

## 🌐 Step 7: Deploy Your Application

### Build the React App:

```bash
npm install
npm run build
```

### Upload to Hosting:

1. Upload contents of `dist/` folder to `public_html/`
2. Upload `api/` folder to `public_html/api/`
3. Create `uploads/` folder with proper permissions

### Create `.htaccess` (for Apache):

```apache
RewriteEngine On

# Handle React Router
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/uploads/
RewriteRule . /index.html [L]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# Protect uploads
<Directory "uploads/documents">
    # Only allow authenticated access
    Order deny,allow
    Deny from all
</Directory>
```

---

## 👤 Step 8: Create Admin Account

Run this SQL in phpMyAdmin:

```sql
-- Create admin user
SET @user_id = UUID();
SET @password_hash = '$2y$10$YourHashedPasswordHere'; -- Use PHP password_hash()

INSERT INTO users (id, email, password_hash, email_verified) 
VALUES (@user_id, 'admin@yourdomain.com', @password_hash, 1);

INSERT INTO profiles (id, email, full_name) 
VALUES (@user_id, 'admin@yourdomain.com', 'Admin User');

INSERT INTO user_roles (id, user_id, role) 
VALUES (UUID(), @user_id, 'admin');
```

Or use this PHP script to generate the password hash:

```php
<?php
$password = 'your-admin-password';
echo password_hash($password, PASSWORD_DEFAULT);
?>
```

---

## ✅ Quick Setup Checklist

- [ ] Created MySQL database in cPanel
- [ ] Imported database schema via phpMyAdmin
- [ ] Created API folder with PHP files
- [ ] Updated frontend `.env` with API URL
- [ ] Built React app (`npm run build`)
- [ ] Uploaded `dist/` to `public_html/`
- [ ] Uploaded `api/` folder
- [ ] Created `uploads/` folder with permissions
- [ ] Added `.htaccess` for routing
- [ ] Created admin account
- [ ] Tested login functionality

---

## 🆘 Troubleshooting

### Database connection failed?
- Check `api/config.php` credentials
- Verify MySQL user has permissions

### API returning 500 error?
- Check PHP error logs in cPanel
- Enable error reporting temporarily

### Images not uploading?
- Check folder permissions (755)
- Verify PHP `upload_max_filesize`

### React routes not working?
- Check `.htaccess` is uploaded
- Verify `mod_rewrite` is enabled

---

## 💰 Estimated Costs

| Service | Cost |
|---------|------|
| Shared Hosting (cPanel) | $3-10/month |
| Domain | $10-15/year |
| SSL | Free (Let's Encrypt) |

**Total: ~$3-10/month**

---

## 📞 Support

For assistance with setup:
- Email: support@zonoir.com
- Documentation: https://docs.zonoir.com

---

*Last updated: January 2026*
