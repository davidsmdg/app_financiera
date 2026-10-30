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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          is_pro: boolean
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          is_pro?: boolean
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          is_pro?: boolean
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'yield_earn'
          balance: number
          currency: string
          color: string | null
          apy_percentage: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: 'checking' | 'savings' | 'credit' | 'yield_earn'
          balance?: number
          currency?: string
          color?: string | null
          apy_percentage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit' | 'yield_earn'
          balance?: number
          currency?: string
          color?: string | null
          apy_percentage?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          type: 'income' | 'expense'
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          type: 'income' | 'expense'
          icon: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          description: string | null
          transaction_date: string
          status: 'completed' | 'pending' | 'cancelled'
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id?: string | null
          amount: number
          type: 'income' | 'expense' | 'transfer'
          description?: string | null
          transaction_date?: string
          status?: 'completed' | 'pending' | 'cancelled'
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string | null
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          description?: string | null
          transaction_date?: string
          status?: 'completed' | 'pending' | 'cancelled'
          payment_method?: string | null
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          currency: string
          deadline_date: string | null
          illustration: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          currency?: string
          deadline_date?: string | null
          illustration?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          currency?: string
          deadline_date?: string | null
          illustration?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      obligations: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          amount: number
          due_day: number
          frequency: 'monthly' | 'biweekly' | 'annual'
          reminder_days_before: number
          account_id: string | null
          color: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          amount: number
          due_day: number
          frequency?: 'monthly' | 'biweekly' | 'annual'
          reminder_days_before?: number
          account_id?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          amount?: number
          due_day?: number
          frequency?: 'monthly' | 'biweekly' | 'annual'
          reminder_days_before?: number
          account_id?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      obligation_payments: {
        Row: {
          id: string
          obligation_id: string
          user_id: string
          month: number
          year: number
          amount_paid: number
          paid_date: string
          status: 'paid' | 'skipped' | 'pending'
          created_at: string
        }
        Insert: {
          id?: string
          obligation_id: string
          user_id: string
          month: number
          year: number
          amount_paid: number
          paid_date?: string
          status?: 'paid' | 'skipped' | 'pending'
          created_at?: string
        }
        Update: {
          id?: string
          obligation_id?: string
          user_id?: string
          month?: number
          year?: number
          amount_paid?: number
          paid_date?: string
          status?: 'paid' | 'skipped' | 'pending'
          created_at?: string
        }
      }
    }
  }
}
