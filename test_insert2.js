const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrbiaofddfbqxabvqbwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYmlhb2ZkZGZicXhhYnZxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTkwMzgsImV4cCI6MjEwMTIzNTAzOH0.vYIPzTkqTp3nyuwlsELuhc9cNPAf-5anHx7kvfIni1g'
);

async function testInsert() {
  const { data, error } = await supabase.from('leads').insert([
    {
      nama_usaha: 'test',
      no_wa: '0812345678',
      kategori: 'Kuliner & F&B',
      status: 'New Lead',
      password_session: '123123'
    }
  ]);
  
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success!");
  }
}

testInsert();
