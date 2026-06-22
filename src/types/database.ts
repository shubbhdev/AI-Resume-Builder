// src/types/database.ts
// Supabase database type definitions
// (Run: npx supabase gen types typescript --local > src/types/database.ts to auto-generate)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionPlan = 'free' | 'trial' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due'
export type BillingInterval = 'monthly' | 'annual'
export type InterviewType = 'behavioral' | 'technical' | 'frontend' | 'react' | 'system_design'
export type ApplicationStatus =
  | 'bookmarked'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string
          phone: string | null
          linkedin_url: string | null
          website_url: string | null
          location: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          phone?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          phone?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: SubscriptionPlan
          status: SubscriptionStatus
          billing_interval: BillingInterval | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_sub_id: string | null
          amount_paise: number | null
          trial_ends_at: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          billing_interval?: BillingInterval | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_sub_id?: string | null
          amount_paise?: number | null
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          billing_interval?: BillingInterval | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_sub_id?: string | null
          amount_paise?: number | null
          trial_ends_at?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          amount: number
          currency: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount: number
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          amount?: number
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          template: string
          content: Json
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          template?: string
          content?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          template?: string
          content?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ats_scans: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          job_description: string | null
          overall_score: number | null
          scores: Json
          keywords_found: string[] | null
          keywords_missing: string[] | null
          suggestions: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          job_description?: string | null
          overall_score?: number | null
          scores?: Json
          keywords_found?: string[] | null
          keywords_missing?: string[] | null
          suggestions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          job_description?: string | null
          overall_score?: number | null
          scores?: Json
          keywords_found?: string[] | null
          keywords_missing?: string[] | null
          suggestions?: Json
          created_at?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          title: string
          company_name: string | null
          job_title: string | null
          job_description: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          title?: string
          company_name?: string | null
          job_title?: string | null
          job_description?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          title?: string
          company_name?: string | null
          job_title?: string | null
          job_description?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          type: InterviewType
          total_score: number | null
          max_score: number | null
          completed: boolean
          duration_secs: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type?: InterviewType
          total_score?: number | null
          max_score?: number | null
          completed?: boolean
          duration_secs?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: InterviewType
          total_score?: number | null
          max_score?: number | null
          completed?: boolean
          duration_secs?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      interview_answers: {
        Row: {
          id: string
          session_id: string
          question: string
          user_answer: string | null
          ai_feedback: string | null
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question: string
          user_answer?: string | null
          ai_feedback?: string | null
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question?: string
          user_answer?: string | null
          ai_feedback?: string | null
          score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          company_name: string
          job_title: string
          job_url: string | null
          location: string | null
          salary_range: string | null
          status: ApplicationStatus
          applied_date: string | null
          follow_up_date: string | null
          notes: string | null
          contacts: Json
          match_score: number | null
          job_description_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          company_name: string
          job_title: string
          job_url?: string | null
          location?: string | null
          salary_range?: string | null
          status?: ApplicationStatus
          applied_date?: string | null
          follow_up_date?: string | null
          notes?: string | null
          contacts?: Json
          match_score?: number | null
          job_description_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          company_name?: string
          job_title?: string
          job_url?: string | null
          location?: string | null
          salary_range?: string | null
          status?: ApplicationStatus
          applied_date?: string | null
          follow_up_date?: string | null
          notes?: string | null
          contacts?: Json
          match_score?: number | null
          job_description_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      billing_interval: BillingInterval
      interview_type: InterviewType
      application_status: ApplicationStatus
    }
  }
}
