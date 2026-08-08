const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrbiaofddfbqxabvqbwl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYmlhb2ZkZGZicXhhYnZxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTkwMzgsImV4cCI6MjEwMTIzNTAzOH0.vYIPzTkqTp3nyuwlsELuhc9cNPAf-5anHx7kvfIni1g'
);

async function checkSchema() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  if (error) {
    console.error("Select error:", error);
  } else {
    console.log("Leads columns:", data.length > 0 ? Object.keys(data[0]) : "No rows, cannot infer schema.");
  }
}

checkSchema();
