export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string | null
          completed_at: string | null
          confidential_notes: string | null
          consultation_fee: number | null
          created_at: string
          created_by: string | null
          doctor_id: string
          duration_minutes: number | null
          icd_code_id: string | null
          id: string
          notes: string | null
          other_fee: number | null
          patient_id: string
          procedure_fee: number | null
          procedure_id: string | null
          reason: string | null
          refund: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_fee: number | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string | null
          completed_at?: string | null
          confidential_notes?: string | null
          consultation_fee?: number | null
          created_at?: string
          created_by?: string | null
          doctor_id: string
          duration_minutes?: number | null
          icd_code_id?: string | null
          id?: string
          notes?: string | null
          other_fee?: number | null
          patient_id: string
          procedure_fee?: number | null
          procedure_id?: string | null
          reason?: string | null
          refund?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_fee?: number | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string | null
          completed_at?: string | null
          confidential_notes?: string | null
          consultation_fee?: number | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          duration_minutes?: number | null
          icd_code_id?: string | null
          id?: string
          notes?: string | null
          other_fee?: number | null
          patient_id?: string
          procedure_fee?: number | null
          procedure_id?: string | null
          reason?: string | null
          refund?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_icd_code_id_fkey"
            columns: ["icd_code_id"]
            isOneToOne: false
            referencedRelation: "clinic_icd_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_leads: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          source?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      clinic_allergies: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_allergies_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_diseases: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_diseases_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_expenses: {
        Row: {
          amount: number
          category: string
          clinic_id: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_expenses_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_icd_codes: {
        Row: {
          clinic_id: string
          code: string
          created_at: string
          description: string
          id: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          code: string
          created_at?: string
          description: string
          id?: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_icd_codes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_membership_plans: {
        Row: {
          clinic_id: string
          color: string
          consultation_discount_pct: number
          created_at: string
          duration_months: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          pharmacy_discount_pct: number
          price: number
          procedure_discount_pct: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          color?: string
          consultation_discount_pct?: number
          created_at?: string
          duration_months?: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          pharmacy_discount_pct?: number
          price?: number
          procedure_discount_pct?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          color?: string
          consultation_discount_pct?: number
          created_at?: string
          duration_months?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          pharmacy_discount_pct?: number
          price?: number
          procedure_discount_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      clinic_payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          doctor_count: number
          id: string
          month: string
          notes: string | null
          payment_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          clinic_id: string
          created_at?: string
          doctor_count?: number
          id?: string
          month: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          doctor_count?: number
          id?: string
          month?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_receptionists: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_receptionists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string
          billable_doctors: number | null
          city: string
          clinic_name: string
          created_at: string
          fee_status: string
          id: string
          no_of_doctors: number
          payment_plan: string
          phone_number: string
          referred_by: string | null
          requested_doctors: number
          status: string
          trial_end_date: string | null
          updated_at: string
        }
        Insert: {
          address: string
          billable_doctors?: number | null
          city: string
          clinic_name: string
          created_at?: string
          fee_status?: string
          id: string
          no_of_doctors?: number
          payment_plan?: string
          phone_number: string
          referred_by?: string | null
          requested_doctors?: number
          status?: string
          trial_end_date?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          billable_doctors?: number | null
          city?: string
          clinic_name?: string
          created_at?: string
          fee_status?: string
          id?: string
          no_of_doctors?: number
          payment_plan?: string
          phone_number?: string
          referred_by?: string | null
          requested_doctors?: number
          status?: string
          trial_end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinics_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_push_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          last_seen_at: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_seen_at?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          last_seen_at?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctor_allergies: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_allergies_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_calendar_tasks: {
        Row: {
          color: string
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          doctor_id: string
          due_date: string
          due_time: string | null
          id: string
          priority: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          doctor_id: string
          due_date: string
          due_time?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          doctor_id?: string
          due_date?: string
          due_time?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_disease_templates: {
        Row: {
          clinic_id: string | null
          created_at: string
          disease_name: string
          doctor_id: string | null
          id: string
          prescription_template: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          disease_name: string
          doctor_id?: string | null
          id?: string
          prescription_template: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          disease_name?: string
          doctor_id?: string | null
          id?: string
          prescription_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_disease_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_disease_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_diseases: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_diseases_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_icd_codes: {
        Row: {
          code: string
          created_at: string
          description: string
          doctor_id: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          doctor_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          doctor_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_icd_codes_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_leaves: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          leave_date: string
          leave_type: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          leave_date: string
          leave_type?: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          leave_date?: string
          leave_type?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_leaves_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_payments: {
        Row: {
          amount: number
          created_at: string
          doctor_id: string
          id: string
          month: string
          notes: string | null
          payment_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          doctor_id: string
          id?: string
          month: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          doctor_id?: string
          id?: string
          month?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_payments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_receptionists: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_receptionists_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_report_templates: {
        Row: {
          clinic_id: string | null
          created_at: string
          doctor_id: string | null
          fields: Json
          id: string
          template_name: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          fields?: Json
          id?: string
          template_name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          fields?: Json
          id?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_report_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_report_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string | null
          id: string
          is_available: boolean
          start_time: string | null
          updated_at: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_sick_leave_templates: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          template_content: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          template_content: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          template_content?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_sick_leave_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_test_templates: {
        Row: {
          clinic_id: string | null
          created_at: string
          description: string
          doctor_id: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          description: string
          doctor_id?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          description?: string
          doctor_id?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_test_templates_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_test_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_work_leave_templates: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          template_content: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          template_content: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          template_content?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_work_leave_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          approved: boolean
          available_days: string[] | null
          available_hours: string | null
          city: string | null
          clinic_address: string | null
          clinic_id: string | null
          clinic_map_location: string | null
          clinic_percentage: number | null
          consultation_fee: number | null
          contact_number: string | null
          created_at: string
          experience_years: number | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          introduction: string | null
          license_number: string | null
          payment_plan: string
          pmdc_number: string | null
          qualification: string
          referred_by: string | null
          specialization: string
          tiktok_url: string | null
          trial_end_date: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          approved?: boolean
          available_days?: string[] | null
          available_hours?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_id?: string | null
          clinic_map_location?: string | null
          clinic_percentage?: number | null
          consultation_fee?: number | null
          contact_number?: string | null
          created_at?: string
          experience_years?: number | null
          facebook_url?: string | null
          id: string
          instagram_url?: string | null
          introduction?: string | null
          license_number?: string | null
          payment_plan?: string
          pmdc_number?: string | null
          qualification: string
          referred_by?: string | null
          specialization: string
          tiktok_url?: string | null
          trial_end_date?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          approved?: boolean
          available_days?: string[] | null
          available_hours?: string | null
          city?: string | null
          clinic_address?: string | null
          clinic_id?: string | null
          clinic_map_location?: string | null
          clinic_percentage?: number | null
          consultation_fee?: number | null
          contact_number?: string | null
          created_at?: string
          experience_years?: number | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          introduction?: string | null
          license_number?: string | null
          payment_plan?: string
          pmdc_number?: string | null
          qualification?: string
          referred_by?: string | null
          specialization?: string
          tiktok_url?: string | null
          trial_end_date?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          batch_id: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          product_id: string
          quantity_delta: number
          reason: string
        }
        Insert: {
          batch_id?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity_delta: number
          reason: string
        }
        Update: {
          batch_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity_delta?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_batches: {
        Row: {
          batch_number: string | null
          clinic_id: string
          created_at: string
          expiry_date: string | null
          id: string
          po_id: string | null
          product_id: string
          quantity_on_hand: number
          quantity_received: number
          received_at: string
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          clinic_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          po_id?: string | null
          product_id: string
          quantity_on_hand?: number
          quantity_received?: number
          received_at?: string
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          clinic_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          po_id?: string | null
          product_id?: string
          quantity_on_hand?: number
          quantity_received?: number
          received_at?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "inventory_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_invoice_items: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          invoice_id: string
          line_total: number
          membership_discount_pct: number | null
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          line_total?: number
          membership_discount_pct?: number | null
          product_id: string
          quantity: number
          unit_price?: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          line_total?: number
          membership_discount_pct?: number | null
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_invoice_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "inventory_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_invoice_return_items: {
        Row: {
          created_at: string
          id: string
          invoice_item_id: string | null
          line_total: number
          product_id: string
          quantity: number
          return_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_item_id?: string | null
          line_total?: number
          product_id: string
          quantity: number
          return_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_item_id?: string | null
          line_total?: number
          product_id?: string
          quantity?: number
          return_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_invoice_return_items_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_invoice_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_invoice_return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_invoice_return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "inventory_invoice_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_invoice_returns: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          return_date: string
          return_number: string
          total_refund: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          return_date?: string
          return_number: string
          total_refund?: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          return_date?: string
          return_number?: string
          total_refund?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_invoice_returns_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_invoice_returns_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "inventory_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_invoices: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          customer_name: string | null
          customer_phone: string | null
          discount: number
          id: string
          invoice_number: string
          notes: string | null
          sale_date: string
          status: Database["public"]["Enums"]["inv_invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          id?: string
          invoice_number: string
          notes?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["inv_invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount?: number
          id?: string
          invoice_number?: string
          notes?: string | null
          sale_date?: string
          status?: Database["public"]["Enums"]["inv_invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_products: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          reorder_level: number
          sale_price: number
          sku: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          reorder_level?: number
          sale_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          reorder_level?: number
          sale_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_products_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_order_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          line_total: number
          po_id: string
          product_id: string
          quantity: number
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          line_total?: number
          po_id: string
          product_id: string
          quantity: number
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          line_total?: number
          po_id?: string
          product_id?: string
          quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "inventory_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_purchase_orders: {
        Row: {
          clinic_id: string
          created_at: string
          created_by: string | null
          discount: number
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          received_date: string | null
          status: Database["public"]["Enums"]["po_status"]
          subtotal: number
          supplier_id: string | null
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          created_by?: string | null
          discount?: number
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          discount?: number
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          received_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          subtotal?: number
          supplier_id?: string | null
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_purchase_orders_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_ledger: {
        Row: {
          batch_id: string | null
          change_qty: number
          clinic_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          product_id: string
          reason: string
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          batch_id?: string | null
          change_qty: number
          clinic_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id: string
          reason: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          batch_id?: string | null
          change_qty?: number
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_ledger_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_ledger_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_ledger_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_suppliers: {
        Row: {
          address: string | null
          clinic_id: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          clinic_id: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          clinic_id?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_suppliers_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          created_by: string | null
          id: string
          invoice_number: string
          notes: string | null
          patient_id: string
          payment_date: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          tax: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          patient_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          tax?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          patient_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          tax?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          document_url: string
          id: string
          medical_record_id: string | null
          patient_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          document_url: string
          id?: string
          medical_record_id?: string | null
          patient_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          medical_record_id?: string | null
          patient_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string
          created_by: string | null
          diagnosis: string | null
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          symptoms: string | null
          test_results: string | null
          updated_at: string
          visit_date: string
          vital_signs: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          symptoms?: string | null
          test_results?: string | null
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string | null
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          symptoms?: string | null
          test_results?: string | null
          updated_at?: string
          visit_date?: string
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_memberships: {
        Row: {
          amount_paid: number
          cancelled_at: string | null
          card_number: string
          clinic_id: string
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          patient_id: string
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          cancelled_at?: string | null
          card_number: string
          clinic_id: string
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          patient_id: string
          plan_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          cancelled_at?: string | null
          card_number?: string
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          patient_id?: string
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_memberships_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "clinic_membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          blood_group: string | null
          city: string | null
          cnic: string | null
          confidential_notes: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          delivery_location: string | null
          delivery_status: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          father_name: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          major_diseases: string | null
          marital_status: string | null
          medical_history: string | null
          patient_id: string
          phone: string
          pregnancy_start_date: string | null
          qr_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          blood_group?: string | null
          city?: string | null
          cnic?: string | null
          confidential_notes?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          delivery_location?: string | null
          delivery_status?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_name?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          major_diseases?: string | null
          marital_status?: string | null
          medical_history?: string | null
          patient_id: string
          phone: string
          pregnancy_start_date?: string | null
          qr_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          blood_group?: string | null
          city?: string | null
          cnic?: string | null
          confidential_notes?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          delivery_location?: string | null
          delivery_status?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_name?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          major_diseases?: string | null
          marital_status?: string | null
          medical_history?: string | null
          patient_id?: string
          phone?: string
          pregnancy_start_date?: string | null
          qr_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medical_record_id: string
          medication_name: string
          patient_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medical_record_id: string
          medication_name: string
          patient_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medical_record_id?: string
          medication_name?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          amount: number
          clinic_email: string | null
          clinic_id: string | null
          clinic_name: string | null
          created_at: string
          doctor_email: string | null
          doctor_id: string | null
          doctor_name: string | null
          entity_type: string
          id: string
          month: string
          paid_at: string | null
          referral_partner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          clinic_email?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_email?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          entity_type: string
          id?: string
          month: string
          paid_at?: string | null
          referral_partner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          clinic_email?: string | null
          clinic_id?: string | null
          clinic_name?: string | null
          created_at?: string
          doctor_email?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          entity_type?: string
          id?: string
          month?: string
          paid_at?: string | null
          referral_partner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_referral_partner_id_fkey"
            columns: ["referral_partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_partners: {
        Row: {
          commission_rate: number
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          referral_code: string
          status: string
          total_earnings: number
          total_referrals: number
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          referral_code: string
          status?: string
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          referral_code?: string
          status?: string
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
        }
        Relationships: []
      }
      seo_doctor_clinics: {
        Row: {
          clinic_location: string | null
          clinic_name: string
          created_at: string
          display_order: number | null
          doctor_id: string
          fee: number | null
          id: string
          map_query: string | null
          timing: string | null
          updated_at: string
        }
        Insert: {
          clinic_location?: string | null
          clinic_name: string
          created_at?: string
          display_order?: number | null
          doctor_id: string
          fee?: number | null
          id?: string
          map_query?: string | null
          timing?: string | null
          updated_at?: string
        }
        Update: {
          clinic_location?: string | null
          clinic_name?: string
          created_at?: string
          display_order?: number | null
          doctor_id?: string
          fee?: number | null
          id?: string
          map_query?: string | null
          timing?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_doctor_clinics_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "seo_doctor_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_doctor_faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number | null
          doctor_id: string
          id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number | null
          doctor_id: string
          id?: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number | null
          doctor_id?: string
          id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_doctor_faqs_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "seo_doctor_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_doctor_listings: {
        Row: {
          avatar_url: string | null
          city: string | null
          clinic_location: string | null
          clinic_name: string | null
          created_at: string
          created_by: string
          experience_years: number | null
          full_name: string
          gender: string | null
          id: string
          introduction: string | null
          is_published: boolean
          pmdc_verified: boolean | null
          qualification: string
          specialization: string
          timing: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          clinic_location?: string | null
          clinic_name?: string | null
          created_at?: string
          created_by: string
          experience_years?: number | null
          full_name: string
          gender?: string | null
          id?: string
          introduction?: string | null
          is_published?: boolean
          pmdc_verified?: boolean | null
          qualification: string
          specialization: string
          timing?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          clinic_location?: string | null
          clinic_name?: string | null
          created_at?: string
          created_by?: string
          experience_years?: number | null
          full_name?: string
          gender?: string | null
          id?: string
          introduction?: string | null
          is_published?: boolean
          pmdc_verified?: boolean | null
          qualification?: string
          specialization?: string
          timing?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      specializations: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specializations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          clinic_id: string | null
          created_at: string
          doctor_id: string | null
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_consultations: {
        Row: {
          appointment_id: string
          created_at: string
          created_by: string | null
          doctor_id: string
          doctor_token: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          patient_id: string
          patient_join_url: string | null
          patient_token: string | null
          recording_url: string | null
          room_name: string
          room_url: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          created_by?: string | null
          doctor_id: string
          doctor_token?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          patient_id: string
          patient_join_url?: string | null
          patient_token?: string | null
          recording_url?: string | null
          room_name: string
          room_url: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          doctor_token?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          patient_id?: string
          patient_join_url?: string | null
          patient_token?: string | null
          recording_url?: string | null
          room_name?: string
          room_url?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_consultations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_records: {
        Row: {
          appointment_id: string | null
          blood_pressure: string | null
          chief_complaint: string | null
          created_at: string
          current_prescription: string | null
          doctor_id: string
          height: string | null
          id: string
          left_eye_vision: string | null
          next_visit_date: string | null
          next_visit_notes: string | null
          ophthalmology_data: Json
          pain_scale: number | null
          patient_history: string | null
          patient_id: string
          pulse: string | null
          right_eye_vision: string | null
          temperature: string | null
          test_reports: string | null
          updated_at: string
          visit_date: string
          weight: string | null
        }
        Insert: {
          appointment_id?: string | null
          blood_pressure?: string | null
          chief_complaint?: string | null
          created_at?: string
          current_prescription?: string | null
          doctor_id: string
          height?: string | null
          id?: string
          left_eye_vision?: string | null
          next_visit_date?: string | null
          next_visit_notes?: string | null
          ophthalmology_data?: Json
          pain_scale?: number | null
          patient_history?: string | null
          patient_id: string
          pulse?: string | null
          right_eye_vision?: string | null
          temperature?: string | null
          test_reports?: string | null
          updated_at?: string
          visit_date?: string
          weight?: string | null
        }
        Update: {
          appointment_id?: string | null
          blood_pressure?: string | null
          chief_complaint?: string | null
          created_at?: string
          current_prescription?: string | null
          doctor_id?: string
          height?: string | null
          id?: string
          left_eye_vision?: string | null
          next_visit_date?: string | null
          next_visit_notes?: string | null
          ophthalmology_data?: Json
          pain_scale?: number | null
          patient_history?: string | null
          patient_id?: string
          pulse?: string | null
          right_eye_vision?: string | null
          temperature?: string | null
          test_reports?: string | null
          updated_at?: string
          visit_date?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      wait_list: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          scheduled_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          scheduled_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          scheduled_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wait_list_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wait_list_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_inventory_adjustment: {
        Args: {
          _batch_id: string
          _clinic_id: string
          _delta: number
          _notes: string
          _product_id: string
          _reason: string
        }
        Returns: string
      }
      can_manage_clinic_inventory: {
        Args: { _clinic_id: string }
        Returns: boolean
      }
      check_password_reset_eligibility: {
        Args: { _email: string }
        Returns: Json
      }
      enroll_patient_membership: {
        Args: {
          _amount_paid?: number
          _clinic_id: string
          _notes?: string
          _patient_id: string
          _plan_id: string
          _start_date?: string
        }
        Returns: string
      }
      generate_inventory_invoice_number: {
        Args: { _clinic_id: string }
        Returns: string
      }
      generate_inventory_po_number: {
        Args: { _clinic_id: string }
        Returns: string
      }
      generate_inventory_return_number: {
        Args: { _clinic_id: string }
        Returns: string
      }
      generate_membership_card_number: {
        Args: { _clinic_id: string }
        Returns: string
      }
      get_active_patient_membership: {
        Args: { _patient_id: string }
        Returns: {
          card_number: string
          clinic_id: string
          color: string
          consultation_discount_pct: number
          end_date: string
          membership_id: string
          pharmacy_discount_pct: number
          plan_id: string
          plan_name: string
          procedure_discount_pct: number
          start_date: string
        }[]
      }
      get_doctor_clinic_id: { Args: { _doctor_id: string }; Returns: string }
      get_doctor_receptionist_doctor_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_public_doctor_booking_availability: {
        Args: { _appointment_date: string; _doctor_id: string }
        Returns: Json
      }
      get_public_doctor_weekly_schedule: {
        Args: { _doctor_id: string }
        Returns: {
          break_end: string
          break_start: string
          day_of_week: number
          end_time: string
          is_available: boolean
          start_time: string
        }[]
      }
      get_receptionist_clinic_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_clinic_active: { Args: { _clinic_id: string }; Returns: boolean }
      is_doctor_receptionist: {
        Args: { _doctor_id: string; _user_id: string }
        Returns: boolean
      }
      is_receptionist_of_clinic: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
      issue_sales_invoice: { Args: { _invoice_id: string }; Returns: undefined }
      public_book_appointment: {
        Args: {
          _appointment_date: string
          _appointment_time: string
          _doctor_id: string
          _full_name: string
          _gender?: string
          _phone: string
          _reason?: string
        }
        Returns: string
      }
      receive_purchase_order: { Args: { _po_id: string }; Returns: undefined }
      return_sales_invoice: {
        Args: {
          _invoice_id: string
          _items: Json
          _notes?: string
          _return_date?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "patient"
        | "clinic"
        | "content_writer"
      appointment_status: "scheduled" | "start" | "cancelled" | "completed"
      gender: "male" | "female" | "other"
      inv_invoice_status: "draft" | "issued" | "cancelled"
      membership_status: "active" | "expired" | "cancelled"
      payment_status: "pending" | "paid" | "partial" | "cancelled"
      po_status: "draft" | "ordered" | "received" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "patient",
        "clinic",
        "content_writer",
      ],
      appointment_status: ["scheduled", "start", "cancelled", "completed"],
      gender: ["male", "female", "other"],
      inv_invoice_status: ["draft", "issued", "cancelled"],
      membership_status: ["active", "expired", "cancelled"],
      payment_status: ["pending", "paid", "partial", "cancelled"],
      po_status: ["draft", "ordered", "received", "cancelled"],
    },
  },
} as const
