const { createClient } = require("@supabase/supabase-js"); 
const { loadEnvConfig } = require("@next/env"); 
loadEnvConfig(process.cwd()); 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 

async function runTest() { 
  const email = `test_${Date.now()}@logaritma.id`;
  const password = "password123";
  const whatsapp = `0851${Date.now().toString().slice(0, 8)}`;
  
  console.log("1. Signing up user...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });
  if (signUpError) {
    console.error("SignUp Error:", signUpError.message);
    return;
  }
  
  const authUser = signUpData.user;
  console.log("User signed up:", authUser.id);
  
  console.log("2. Inserting into merchants...");
  const { data: insertData, error: insertError } = await supabase.from('merchants').insert([{
    user_id: authUser.id,
    nama_usaha: "Test Usaha",
    whatsapp: whatsapp,
    kategori_usaha: "Kuliner & F&B",
    status: 'Trial',
    created_at: new Date().toISOString()
  }]);
  
  if (insertError) {
    console.error("Insert Error:", insertError);
  } else {
    console.log("Insert Success!");
  }
  
  console.log("3. Fetching merchant using select...");
  const { data: fetchMData, error: fetchMError } = await supabase.from('merchants').select('*').eq('user_id', authUser.id).maybeSingle();
  if (fetchMError) {
    console.error("Fetch Error:", fetchMError);
  } else {
    console.log("Fetched Merchant Data:", fetchMData);
  }
} 
runTest();
