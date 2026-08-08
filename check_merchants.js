const { createClient } = require("@supabase/supabase-js"); 
const { loadEnvConfig } = require("@next/env"); 
loadEnvConfig(process.cwd()); 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function test() { 
  const { data, error } = await supabase.from("merchants").select('*'); 
  console.log(data); 
  console.log(error); 
} 
test();
