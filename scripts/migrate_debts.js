import pg from 'pg';
const { Client } = pg;

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres.zxwmunothoejlldlgeob:America12%24Brethard@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to Supabase Postgres');

    const sql = `
      ALTER TABLE public.obligations
      ADD COLUMN IF NOT EXISTS obligation_type TEXT DEFAULT 'recurring',
      ADD COLUMN IF NOT EXISTS total_debt_amount NUMERIC,
      ADD COLUMN IF NOT EXISTS current_balance NUMERIC,
      ADD COLUMN IF NOT EXISTS total_installments INTEGER,
      ADD COLUMN IF NOT EXISTS paid_installments INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS monthly_rate NUMERIC,
      ADD COLUMN IF NOT EXISTS annual_rate NUMERIC,
      ADD COLUMN IF NOT EXISTS insurance_fee NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS loan_number TEXT,
      ADD COLUMN IF NOT EXISTS lender_name TEXT,
      ADD COLUMN IF NOT EXISTS disbursement_date DATE;
    `;

    await client.query(sql);
    console.log('MIGRATION_SUCCESS');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
