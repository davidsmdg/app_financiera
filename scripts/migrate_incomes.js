import pg from 'pg';
const { Client } = pg;

async function migrateIncomes() {
  const client = new Client({
    connectionString: 'postgresql://postgres.zxwmunothoejlldlgeob:America12%24Brethard@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres');

    const sql = `
      CREATE TABLE IF NOT EXISTS public.incomes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        income_type TEXT NOT NULL DEFAULT 'recurring', -- 'recurring' | 'occasional'
        frequency TEXT NOT NULL DEFAULT 'monthly',     -- 'monthly' | 'biweekly' | 'weekly' | 'one_time'
        payment_day INTEGER,                           -- Día del mes (1 - 31) o fecha
        income_date DATE,                              -- Para ingresos ocasionales
        is_active BOOLEAN DEFAULT TRUE,
        category TEXT DEFAULT 'Salario',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'incomes' AND policyname = 'Users can manage their own incomes'
        ) THEN
          CREATE POLICY "Users can manage their own incomes" 
          ON public.incomes 
          FOR ALL 
          USING (auth.uid() = user_id) 
          WITH CHECK (auth.uid() = user_id);
        END IF;
      END $$;
    `;

    await client.query(sql);
    console.log('INCOMES_TABLE_CREATED_SUCCESSFULLY');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrateIncomes();
