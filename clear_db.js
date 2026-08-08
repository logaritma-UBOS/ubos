const { createClient } = require("@supabase/supabase-js"); 
const { loadEnvConfig } = require("@next/env"); 
loadEnvConfig(process.cwd()); 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function test() { 
  await supabase.from("leads").delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
  await supabase.from("merchants").delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
  console.log('Cleared leads and merchants'); 
} 
test();
