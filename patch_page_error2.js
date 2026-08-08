const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldCatch = `        try {
          result = JSON.parse(textRes);
        } catch (e) {
          console.error("Non-JSON Response from API:", textRes.substring(0, 200));
          if (res.status === 404) {
            throw new Error('Sistem sedang dalam proses pembaruan (Vercel Deploying). Mohon tunggu 1-2 menit lalu coba lagi.');
          }
          throw new Error('Terjadi gangguan server (500). Mohon coba lagi beberapa saat.');
        }`;

const newCatch = `        try {
          result = JSON.parse(textRes);
        } catch (e) {
          console.error("Non-JSON Response from API:", textRes.substring(0, 200));
          if (res.status === 404) {
            throw new Error('Sistem sedang dalam proses pembaruan (Vercel Deploying). Mohon tunggu 1-2 menit lalu coba lagi.');
          }
          // TAMPILKAN HTML ERROR AGAR BISA DIBACA!
          throw new Error('500 Error: ' + textRes.substring(0, 100));
        }`;

if (pageCode.includes(oldCatch)) {
  pageCode = pageCode.replace(oldCatch, newCatch);
  fs.writeFileSync('src/app/page.tsx', pageCode);
  console.log("Successfully patched fetch error handling again in page.tsx");
} else {
  console.log("Could not find block in page.tsx.");
}
