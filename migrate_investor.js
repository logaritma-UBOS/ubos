const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrbiaofddfbqxabvqbwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYmlhb2ZkZGZicXhhYnZxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTkwMzgsImV4cCI6MjEwMTIzNTAzOH0.vYIPzTkqTp3nyuwlsELuhc9cNPAf-5anHx7kvfIni1g';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching funded items...");
  const { data: fundedItems, error: fErr } = await supabase
    .from('funding_items')
    .select('*')
    .eq('is_funded', true);

  if (fErr) {
    console.error("Error fetching funded items:", fErr);
    return;
  }
  
  console.log("Found funded items:", fundedItems.map(f => f.title));

  console.log("Fetching existing cash transactions...");
  const { data: cashTxs, error: cErr } = await supabase
    .from('cash_transactions')
    .select('*')
    .eq('category', 'Inject Modal Investor');

  if (cErr) {
    console.error("Error fetching cash transactions:", cErr);
    return;
  }
  
  for (const item of fundedItems) {
    // Check if this item is already in cash_transactions
    const alreadyExists = cashTxs.some(tx => (tx.description || '').includes(item.title));
    if (!alreadyExists) {
      console.log(`Item missing in cash_transactions: ${item.title}. Inserting...`);
      const { error: insErr } = await supabase.from('cash_transactions').insert([{
        transaction_date: (item.funded_at ? new Date(item.funded_at) : new Date()).toISOString().split('T')[0],
        type: 'IN',
        category: 'Inject Modal Investor',
        description: `Pendanaan Investor: ${item.title}`,
        amount: item.price
      }]);
      
      if (insErr) {
        console.error("Failed to insert:", item.title, insErr);
      } else {
        console.log("Inserted successfully!");
      }
    } else {
      console.log(`Item already exists in cash_transactions: ${item.title}`);
    }
  }
}

run();
