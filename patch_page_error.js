const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldFetch = `      const res = await fetch('/api/leads/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          password: formData.password,
          funnel_destination: funnelDest
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal mendaftar. Silakan coba lagi.');
      }`;

const newFetch = `      const res = await fetch('/api/leads/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          password: formData.password,
          funnel_destination: funnelDest
        })
      });

      let result;
      try {
        const textRes = await res.text();
        try {
          result = JSON.parse(textRes);
        } catch (e) {
          console.error("Non-JSON Response from API:", textRes.substring(0, 200));
          if (res.status === 404) {
            throw new Error('Sistem sedang dalam proses pembaruan (Vercel Deploying). Mohon tunggu 1-2 menit lalu coba lagi.');
          }
          throw new Error('Terjadi gangguan server (500). Mohon coba lagi beberapa saat.');
        }
      } catch (e: any) {
        throw new Error(e.message || 'Terjadi kesalahan sistem.');
      }

      if (!res.ok || !result.success) {
        throw new Error(result?.error || 'Gagal mendaftar. Silakan coba lagi.');
      }`;

if (pageCode.includes(oldFetch)) {
  pageCode = pageCode.replace(oldFetch, newFetch);
  fs.writeFileSync('src/app/page.tsx', pageCode);
  console.log("Successfully patched fetch error handling in page.tsx");
} else {
  console.log("Could not find block in page.tsx.");
}
