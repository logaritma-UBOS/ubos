const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrbiaofddfbqxabvqbwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYmlhb2ZkZGZicXhhYnZxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTkwMzgsImV4cCI6MjEwMTIzNTAzOH0.vYIPzTkqTp3nyuwlsELuhc9cNPAf-5anHx7kvfIni1g'
);

async function testSelectAll() {
  const { data, error } = await supabase.from('leads').select('*');
  console.log("All data:", data);
}

testSelectAll();
