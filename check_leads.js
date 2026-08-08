const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('leads').select('*').eq('no_wa', '6285175150408');
  console.log('Leads:', JSON.stringify(data, null, 2));
}
check();
