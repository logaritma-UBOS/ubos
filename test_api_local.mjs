import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/leads/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error("Request error:", e);
});

req.write(JSON.stringify({
  nama_usaha: 'test',
  no_wa: '0812',
  kategori: 'test',
  password: '123',
  funnel_destination: 'UBOS'
}));

req.end();
