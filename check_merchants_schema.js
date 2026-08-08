const { createClient } = require("@supabase/supabase-js"); 
const { loadEnvConfig } = require("@next/env"); 
loadEnvConfig(process.cwd()); 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 

async function runTest() { 
  console.log("Checking columns in merchants via an empty insert error:");
  const { error } = await supabase.from('merchants').insert([{ id: '00000000-0000-0000-0000-000000000000' }]);
  console.log("Error:", error);
} 
runTest();
