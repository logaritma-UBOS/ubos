import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch[1].trim();
const key = keyMatch[1].trim();

async function check() {
  const res = await fetch(`${url}/rest/v1/page_traffic_logs`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      session_id: 'test-session-' + Date.now(),
      traffic_source: 'API Test',
      device_info: 'Node.js',
      browser: 'Test',
      landing_path: '/test'
    })
  });
  
  if (res.ok) {
    const data = await res.json();
    console.log('INSERT SUCCESS:', data);
  } else {
    const err = await res.text();
    console.log('INSERT FAILED:', res.status, err);
  }
}
check();
