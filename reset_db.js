const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reset() {
  console.log('Menghapus data payout_requests...');
  const res1 = await supabase.from('payout_requests').delete().not('id', 'is', null);
  console.log('payout_requests:', res1.error ? res1.error : 'OK');

  console.log('Menghapus data merchants...');
  const res2 = await supabase.from('merchants').delete().not('id', 'is', null);
  console.log('merchants:', res2.error ? res2.error : 'OK');

  console.log('Menghapus data leads...');
  const res3 = await supabase.from('leads').delete().not('id', 'is', null);
  console.log('leads:', res3.error ? res3.error : 'OK');

  console.log('Reset Selesai.');
}
reset();
