import pg from 'pg';
const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.zxwmunothoejlldlgeob:America12%24Brethard@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
  });
  await client.connect();
  const sql = `
    ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS personality_category TEXT,
    ADD COLUMN IF NOT EXISTS space_id UUID;
  `;
  await client.query(sql);
  console.log('TRANSACTIONS_UPDATED_SUCCESSFULLY');
  await client.end();
}
run();
