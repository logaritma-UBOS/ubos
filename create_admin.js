import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jrbiaofddfbqxabvqbwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYmlhb2ZkZGZicXhhYnZxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTkwMzgsImV4cCI6MjEwMTIzNTAzOH0.vYIPzTkqTp3nyuwlsELuhc9cNPAf-5anHx7kvfIni1g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Mencoba sign up admin...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'logaritma.tim@gmail.com',
    password: 'adminlog2026',
  });

  let user = authData?.user;

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log("Email sudah ada, mencoba login...");
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'logaritma.tim@gmail.com',
        password: 'adminlog2026',
      });
      if (loginError) {
        console.error("Gagal login:", loginError.message);
        return;
      }
      user = loginData.user;
    } else {
      console.error("Gagal sign up:", authError.message);
      return;
    }
  }

  if (!user) {
    console.error("Gagal mendapatkan objek user.");
    return;
  }

  console.log("User ID:", user.id);

  // Buat atau perbarui profil merchant dengan is_admin = true
  const { data: existing } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('merchants')
      .update({ is_admin: true })
      .eq('id', existing.id);
    if (error) console.error("Gagal update admin:", error);
    else console.log("Berhasil set is_admin = true (Update)");
  } else {
    const { error } = await supabase
      .from('merchants')
      .insert({
        user_id: user.id,
        nama_usaha: 'Super Admin Logaritma',
        kategori_usaha: 'F&B',
        is_admin: true,
      });
    if (error) console.error("Gagal insert admin:", error);
    else console.log("Berhasil set is_admin = true (Insert)");
  }
}

main();
