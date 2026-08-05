const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Tangkap semua console.log dari halaman
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to /member/login...');
  await page.goto('http://127.0.0.1:3000/member/login', { waitUntil: 'networkidle0' });
  
  console.log('Typing WA number...');
  await page.type('input[type="tel"]', '08123456789');
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');

  // Tunggu beberapa detik untuk melihat navigasi
  console.log('Waiting for 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Current URL:', page.url());
  
  // Jika url masih /member/login, mungkin kita di halaman register. Cek apakah ada form register
  const h2 = await page.$eval('h2', el => el.textContent).catch(() => null);
  console.log('Found h2:', h2);

  if (h2 && h2.includes('Isi Data Usaha')) {
    console.log('We are at Register step!');
    await page.type('input[placeholder="Budi Santoso"]', 'Test Budi');
    await page.type('input[placeholder="Warung Makan Sari"]', 'Test Warung');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for 3 seconds for register redirect...');
    await new Promise(r => setTimeout(r, 3000));
    console.log('Current URL after register:', page.url());
  }

  // Coba screenshot hasil akhirnya
  await page.screenshot({ path: 'test_login_result.png' });
  
  await browser.close();
  console.log('Done');
})();
