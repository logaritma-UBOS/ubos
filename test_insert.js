const { createClient } = require("@supabase/supabase-js"); 
const { loadEnvConfig } = require("@next/env"); 
loadEnvConfig(process.cwd()); 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function test() { 
  const res = await supabase.from("leads").insert([{ nama_usaha: "Test", no_wa: "628999999999", password_session: "test" }]); 
  console.log(JSON.stringify(res, null, 2)); 
} 
test();
