import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface UserProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  role: 'manager' | 'staff'
  facility_id: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Facility {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  title: string
  description?: string
  facility_id: string
  created_by: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Question {
  id: string
  form_id: string
  question_text: string
  question_type: 'text' | 'multiple_choice' | 'yes_no' | 'rating' | 'scale' | 'long_text'
  options?: string[]
  required: boolean
  order_index: number
}

export interface FormSubmission {
  id: string
  form_id: string
  submitted_by: string
  submitted_at: string
  status: 'completed' | 'draft'
}

export interface Answer {
  id: string
  submission_id: string
  question_id: string
  answer_value: string
}