const fs = require('fs');
const path = require('path');

// 1. Create src/app/admin/crm/page.tsx
const crmDir = path.join('src', 'app', 'admin', 'crm');
if (!fs.existsSync(crmDir)) {
  fs.mkdirSync(crmDir, { recursive: true });
}

const crmCode = `'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { MessageSquare, Send, Smartphone, Activity, CheckCircle2, XCircle, Loader2, Users } from 'lucide-react';

export default function WACRMPage() {
  const [token, setToken] = useState('');
  const [deviceStatus, setDeviceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  
  const [broadcastMsg, setBroadcastMsg] = useState('Halo {nama_usaha},\\n\\nTerima kasih telah bergabung di Logaritma.\\n\\nSilakan akses dashboard Anda melalui: {link_dashboard}');
  const [targetCategory, setTargetCategory] = useState('All');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [autoWelcome, setAutoWelcome] = useState(true); // Default active as requested

  useEffect(() => {
    // Load saved token if any
    const saved = localStorage.getItem('fonnte_token_override');
    if (saved) setToken(saved);
    checkDeviceStatus(saved || '');
  }, []);

  const checkDeviceStatus = async (overrideToken: string) => {
    setDeviceStatus('checking');
    try {
      const res = await fetch('https://api.fonnte.com/device', {
        method: 'POST',
        headers: { 'Authorization': overrideToken || process.env.NEXT_PUBLIC_FONNTE_TOKEN || 'rw47gsoTHcy86wGbxAtW' }
      });
      const data = await res.json();
      if (data.status) {
        setDeviceStatus('connected');
        setDeviceInfo(data);
      } else {
        setDeviceStatus('disconnected');
      }
    } catch (e) {
      setDeviceStatus('disconnected');
    }
  };

  const handleSaveToken = () => {
    localStorage.setItem('fonnte_token_override', token);
    toast.success('Token tersimpan di perangkat ini.');
    checkDeviceStatus(token);
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg) return toast.error('Pesan tidak boleh kosong.');
    setIsBroadcasting(true);
    
    try {
      // Fetch leads based on category
      let query = supabase.from('leads').select('*');
      if (targetCategory !== 'All') {
        if (targetCategory === 'Kuliner') query = query.ilike('kategori', '%Kuliner%');
        else query = query.ilike('kategori', \`%\${targetCategory}%\`);
      }
      
      const { data: leads, error } = await query;
      
      if (error) throw new Error(error.message);
      if (!leads || leads.length === 0) throw new Error('Tidak ada data leads untuk kategori ini.');

      // Send to our API
      const res = await fetch('/api/wa/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: leads.map(l => ({
            target: l.no_wa || l.whatsapp,
            nama_usaha: l.nama_usaha,
            funnel_destination: l.funnel_destination
          })),
          messageTemplate: broadcastMsg,
          tokenOverride: token || undefined
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success(\`Broadcast dikirim ke \${leads.length} kontak.\`);
        setBroadcastMsg('');
      } else {
        throw new Error(result.error || 'Gagal mengirim broadcast');
      }

    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-400" /> WhatsApp CRM Dashboard
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Kelola Fonnte API & Broadcast Promosi</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panel Status Fonnte */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="font-black text-white mb-6 flex items-center gap-2 relative z-10">
            <Smartphone size={18} className="text-emerald-400" /> Fonnte Device Status
          </h3>
          
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="p-3 bg-slate-800 rounded-lg">
              {deviceStatus === 'checking' ? <Loader2 className="animate-spin text-slate-400" /> :
               deviceStatus === 'connected' ? <CheckCircle2 className="text-emerald-400" /> :
               <XCircle className="text-red-400" />}
            </div>
            <div>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Koneksi WhatsApp</p>
              <p className={\`text-lg font-black \${deviceStatus === 'connected' ? 'text-emerald-400' : 'text-slate-300'}\`}>
                {deviceStatus === 'checking' ? 'Memeriksa...' : 
                 deviceStatus === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
              </p>
            </div>
            {deviceStatus === 'connected' && deviceInfo?.quota && (
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 font-bold uppercase">Sisa Kuota</p>
                <p className="text-lg font-black text-white">{deviceInfo.quota}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Override Fonnte Token (Opsional)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Kosongkan untuk pakai .env default"
                  className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
                />
                <button onClick={handleSaveToken} className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm transition-colors">
                  Simpan & Cek
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Default .env terdeteksi dan akan digunakan jika input ini kosong.</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
             <div className="flex items-center justify-between">
                <div>
                   <p className="font-bold text-white">Auto-Welcome WA</p>
                   <p className="text-xs text-slate-400 mt-1">Otomatis kirim pesan saat ada Lead baru dari Landing Page.</p>
                </div>
                <button 
                  onClick={() => setAutoWelcome(!autoWelcome)}
                  className={\`w-12 h-6 rounded-full transition-colors relative \${autoWelcome ? 'bg-emerald-500' : 'bg-slate-700'}\`}
                >
                  <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${autoWelcome ? 'translate-x-7' : 'translate-x-1'}\`}></div>
                </button>
             </div>
          </div>
        </div>

        {/* Broadcast Panel */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
          <h3 className="font-black text-white mb-6 flex items-center gap-2">
            <Send size={18} className="text-blue-400" /> One-Tap Clearance & Promo
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex justify-between">
                <span>Filter Kategori Target</span>
              </label>
              <select 
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-bold"
              >
                <option value="All">Semua Kategori Usaha</option>
                <option value="Kuliner">Kuliner & F&B</option>
                <option value="Percetakan">Percetakan</option>
                <option value="Ritel">Ritel</option>
                <option value="Jasa / Lainnya">Jasa / Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pesan Broadcast</label>
              <textarea 
                rows={6}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
              ></textarea>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{'{nama_usaha}'}</span>
                <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{'{whatsapp}'}</span>
                <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{'{link_dashboard}'}</span>
              </div>
            </div>

            <button 
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isBroadcasting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {isBroadcasting ? 'Mengirim Broadcast...' : 'Kirim Broadcast Sekarang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`;
fs.writeFileSync(path.join(crmDir, 'page.tsx'), crmCode);

// 2. Create API Route src/app/api/wa/send/route.ts
const apiDir = path.join('src', 'app', 'api', 'wa', 'send');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const apiCode = \`export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.tokenOverride || process.env.NEXT_PUBLIC_FONNTE_TOKEN || process.env.FONNTE_TOKEN || 'rw47gsoTHcy86wGbxAtW';

    // Mendukung mode SINGLE message maupun BULK message (array of leads)
    const { target, message, leads, messageTemplate } = body;

    if (leads && Array.isArray(leads) && messageTemplate) {
      // MODE BULK / BROADCAST
      const fetchPromises = leads.map(lead => {
        let finalMessage = messageTemplate
          .replace(/{nama_usaha}/g, lead.nama_usaha || 'Bapak/Ibu')
          .replace(/{whatsapp}/g, lead.target || '')
          .replace(/{link_dashboard}/g, lead.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');
          
        const formData = new URLSearchParams();
        formData.append('target', lead.target);
        formData.append('message', finalMessage);

        return fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: { 'Authorization': token },
          body: formData,
        });
      });

      await Promise.all(fetchPromises);
      return NextResponse.json({ success: true, message: 'Broadcast dikirim.' });
      
    } else if (target) {
      // MODE SINGLE (Welcome WA)
      let finalMessage = (message || 'Halo, pendaftaran berhasil!')
        .replace(/{nama_usaha}/g, body.nama_usaha || 'Bapak/Ibu')
        .replace(/{link_dashboard}/g, body.funnel_destination === 'UBOS' ? 'https://logaritma.id/ubos' : 'https://logaritma.id/member');

      const formData = new URLSearchParams();
      formData.append('target', target);
      formData.append('message', finalMessage);

      const fonnteRes = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData,
      });

      const data = await fonnteRes.json();
      if (!fonnteRes.ok || !data.status) {
        throw new Error(data.reason || 'Fonnte API Error');
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });

  } catch (error: any) {
    console.error('Fonnte API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}\`;
fs.writeFileSync(path.join(apiDir, 'route.ts'), apiCode);

// 3. Injeksi Pemicu Auto-Welcome WA pada form registrasi di src/app/page.tsx
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
  console.log("Could not find old insert in page.tsx. The file might have been formatted differently.");
}

console.log("WA CRM integration scripts generated.");
