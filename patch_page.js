const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldHandleRegister = `      // Cek Keberadaan WA di Supabase
      const { data: existingLead, error: checkErr } = await supabase
        .from('leads')
        .select('*')
        .eq('no_wa', cleanWA)
        .maybeSingle();

      if (checkErr) {
        throw new Error('Gagal mengecek data. Silakan coba lagi.');
      }

      if (existingLead) {
        // PENANGANAN USER LAMA (EXISTING USER)
        if (existingLead.password_session === formData.password) {
          setShowModal(false);
          toast.success("Login berhasil! Mengalihkan...");
          
          if (existingLead.funnel_destination === 'UBOS' || isFnB) {
            router.push(\`/ubos\`);
          } else {
            setShowDevPopup(true);
          }
          return;
        } else {
          // Password Salah - Modal tetap terbuka (tidak panggil setShowModal)
          throw new Error('Nomor WhatsApp sudah terdaftar. Password tidak sesuai.');
        }
      }

      // PENANGANAN USER BARU (NEW USER)
      const { error: insertErr } = await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead',
          password_session: formData.password,
          funnel_destination: funnelDest
        }
      ]);

      if (insertErr) {
        throw new Error('Gagal mendaftar. Silakan coba lagi.');
      }
      
      // AUTO-WELCOME WA VIA FONNTE
      try {
        const welcomeMessage = \`Halo {nama_usaha}! 🚀\\n\\nSelamat bergabung di ekosistem Logaritma UBOS.\\nPendaftaran Anda telah kami terima.\\n\\nSilakan akses dashboard Anda melalui tautan berikut:\\n{link_dashboard}\\n\\nJika ada pertanyaan, jangan ragu membalas pesan ini!\\n\\n- Tim Logaritma\`;
        
        fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest
          })
        }).catch(err => console.error("Fonnte trigger err:", err));
      } catch (waErr) {
        console.error("Gagal mengirim WA Welcome:", waErr);
      }`;

const newHandleRegister = `      // Panggil API Route untuk bypass RLS & Handle Cek/Insert
      const res = await fetch('/api/leads/register', {
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
      }

      if (!result.isNew) {
        // PENANGANAN USER LAMA (EXISTING USER)
        setShowModal(false);
        toast.success("Login berhasil! Mengalihkan...");
        
        if (result.data?.funnel_destination === 'UBOS' || isFnB) {
          router.push(\`/ubos\`);
        } else {
          setShowDevPopup(true);
        }
        return;
      }
      
      // AUTO-WELCOME WA VIA FONNTE (HANYA UNTUK USER BARU)
      try {
        const welcomeMessage = \`Halo {nama_usaha}! 🚀\\n\\nSelamat bergabung di ekosistem Logaritma UBOS.\\nPendaftaran Anda telah kami terima.\\n\\nSilakan akses dashboard Anda melalui tautan berikut:\\n{link_dashboard}\\n\\nJika ada pertanyaan, jangan ragu membalas pesan ini!\\n\\n- Tim Logaritma\`;
        
        fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: cleanWA,
            message: welcomeMessage,
            nama_usaha: formData.merchantName,
            funnel_destination: funnelDest
          })
        }).catch(err => console.error("Fonnte trigger err:", err));
      } catch (waErr) {
        console.error("Gagal mengirim WA Welcome:", waErr);
      }`;

if (pageCode.includes(oldHandleRegister)) {
  pageCode = pageCode.replace(oldHandleRegister, newHandleRegister);
  fs.writeFileSync('src/app/page.tsx', pageCode);
  console.log("Successfully updated to use API route.");
} else {
  console.log("Could not find block in page.tsx.");
}
