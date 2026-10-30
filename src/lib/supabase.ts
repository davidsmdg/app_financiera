import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxwmunothoejlldlgeob.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d211bm90aG9lamxsZGxnZW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyODY3MDksImV4cCI6MjEwODg2MjcwOX0.V3Ce2EYkFACzrzU6MLJ2DHTqL0MN19d8JXvMdJH_yAQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

