const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldInsertLeads = `      // Record to Leads Database with new schema fields
      await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead',
          password_session: formData.password,
          funnel_destination: funnelDest
        }
      ]);
      
      setShowModal(false);`;

const newInsertLeads = `      // Record to Leads Database with new schema fields
      await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead',
          password_session: formData.password,
          funnel_destination: funnelDest
        }
      ]);
      
      // AUTO-WELCOME WA VIA FONNTE
      try {
        const welcomeMessage = \`Halo {nama_usaha}! 🚀\\n\\nSelamat bergabung di ekosistem Logaritma UBOS.\\nPendaftaran Anda telah kami terima.\\n\\nSilakan akses dashboard Anda melalui tautan berikut:\\n{link_dashboard}\\n\\nJika ada pertanyaan, jangan ragu membalas pesan ini!\\n\\n- Tim Logaritma\`;
        
        await fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest
          })
        });
      } catch (waErr) {
        console.error("Gagal mengirim WA Welcome:", waErr);
      }
      
      setShowModal(false);`;

if (pageCode.includes(oldInsertLeads)) {
  pageCode = pageCode.replace(oldInsertLeads, newInsertLeads);
  fs.writeFileSync('src/app/page.tsx', pageCode);
  console.log("Successfully injected Auto-Welcome WA to page.tsx");
} else {
  console.log("Could not find old insert in page.tsx.");
}
