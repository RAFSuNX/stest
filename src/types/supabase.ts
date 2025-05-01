export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          roll_number: string
          full_name: string
          session: string
          is_session_rep: boolean
          created_at: string
        }
        Insert: {
          id?: string
          roll_number: string
          full_name: string
          session: string
          is_session_rep?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          roll_number?: string
          full_name?: string
          session?: string
          is_session_rep?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          content: string
          category: 'important' | 'academic' | 'general'
          target_sessions: string[]
          created_by_id: string
          created_by_role: string
          created_by_session: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: 'important' | 'academic' | 'general'
          target_sessions: string[]
          created_by_id: string
          created_by_role: string
          created_by_session?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: 'important' | 'academic' | 'general'
          target_sessions?: string[]
          created_by_id?: string
          created_by_role?: string
          created_by_session?: string | null
          created_at?: string
        }
      }
      read_status: {
        Row: {
          id: string
          student_id: string
          notification_id: string
          read_at: string
        }
        Insert: {
          id?: string
          student_id: string
          notification_id: string
          read_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          notification_id?: string
          read_at?: string
        }
      }
    }
    Functions: {
      get_claims: {
        Args: {
          uid: string
        }
        Returns: Json
      }
    }
    Enums: {
      notification_category: 'important' | 'academic' | 'general'
    }
  }
}