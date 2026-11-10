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
          space_id?: string | null
          consumption_kwh?: number | null
          consumption_period?: string | null
          obligation_type?: 'recurring' | 'debt'
          total_debt_amount?: number | null
          current_balance?: number | null
          total_installments?: number | null
          paid_installments?: number | null
          monthly_rate?: number | null
          annual_rate?: number | null
          insurance_fee?: number | null
          loan_number?: string | null
          lender_name?: string | null
          disbursement_date?: string | null
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
          space_id?: string | null
          consumption_kwh?: number | null
          consumption_period?: string | null
          obligation_type?: 'recurring' | 'debt'
          total_debt_amount?: number | null
          current_balance?: number | null
          total_installments?: number | null
          paid_installments?: number | null
          monthly_rate?: number | null
          annual_rate?: number | null
          insurance_fee?: number | null
          loan_number?: string | null
          lender_name?: string | null
          disbursement_date?: string | null
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
          space_id?: string | null
          consumption_kwh?: number | null
          consumption_period?: string | null
          obligation_type?: 'recurring' | 'debt'
          total_debt_amount?: number | null
          current_balance?: number | null
          total_installments?: number | null
          paid_installments?: number | null
          monthly_rate?: number | null
          annual_rate?: number | null
          insurance_fee?: number | null
          loan_number?: string | null
          lender_name?: string | null
          disbursement_date?: string | null
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
      incomes: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          income_type: 'recurring' | 'occasional'
          frequency: 'monthly' | 'biweekly' | 'weekly' | 'one_time'
          payment_day: number | null
          income_date: string | null
          is_active: boolean
          category: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          income_type?: 'recurring' | 'occasional'
          frequency?: 'monthly' | 'biweekly' | 'weekly' | 'one_time'
          payment_day?: number | null
          income_date?: string | null
          is_active?: boolean
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          income_type?: 'recurring' | 'occasional'
          frequency?: 'monthly' | 'biweekly' | 'weekly' | 'one_time'
          payment_day?: number | null
          income_date?: string | null
          is_active?: boolean
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
