'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, User, Store, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'login' | 'register' | 'success';

export default function MemberLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginWA, setLoginWA] = useState('');

  // Register form state (muncul jika WA tidak ditemukan)
  const [regWA, setRegWA] = useState('');
  const [regName, setRegName] = useState('');
  const [regShop, setRegShop] = useState('');
  const [regCategory, setRegCategory] = useState('Kuliner & F&B');

  // ── STEP 1: Cek nomor WA ────────────────────────────────────────────────
  const handleCheckWA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rawWA = loginWA.replace(/\D/g, '');
    if (rawWA.length < 10) {
      setError('Nomor WhatsApp tidak valid. Minimal 10 digit.');
      setLoading(false);
      return;
    }

    // Normalisasi: 08xx → 628xx
    let normalWA = rawWA;
    if (rawWA.startsWith('0')) normalWA = '62' + rawWA.slice(1);
    else if (rawWA.startsWith('8')) normalWA = '62' + rawWA;

    let found: any = null;

    // Cek localStorage dulu (paling cepat)
    try {
      const stored = localStorage.getItem('ubos_lead');
      if (stored) {
        const d = JSON.parse(stored);
        const storedWA = (d.whatsapp || '').replace(/\D/g, '');
        if (storedWA === rawWA || storedWA === normalWA) {
          found = { nama_pemilik: d.owner_name || '', nama_usaha: d.nama_usaha || '', no_wa: storedWA, kategori: d.kategori_usaha || 'Kuliner & F&B' };
        }
      }
    } catch (_) {}

    // Cek tabel leads (jika belum ketemu)
    if (!found) {
      try {
        const { data } = await supabase.from('leads').select('nama_pemilik,nama_usaha,no_wa,kategori').or(`no_wa.eq.${rawWA},no_wa.eq.${normalWA}`).maybeSingle();
        if (data) found = data;
      } catch (_) {}
    }

    // Cek waiting_list (fallback lama)
    if (!found) {
      try {
        const { data } = await supabase.from('waiting_list').select('nama_usaha,whatsapp,kategori_usaha').or(`whatsapp.eq.${rawWA},whatsapp.eq.${normalWA}`).maybeSingle();
        if (data) found = { nama_usaha: data.nama_usaha, no_wa: data.whatsapp, kategori: data.kategori_usaha };
      } catch (_) {}
    }

    setLoading(false);

    if (found) {
      // Data ditemukan → simpan sesi → masuk
      saveSession(found);
      setStep('success');
      setTimeout(() => {
        window.location.href = '/member';
      }, 1000);
    } else {
      // Data tidak ditemukan → tampilkan form registrasi
      setRegWA(loginWA);
      setStep('register');
    }
  };

  // ── STEP 2: Simpan data registrasi baru ─────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const rawWA = regWA.replace(/\D/g, '');
    if (rawWA.length < 10) { setError('Nomor WhatsApp tidak valid.'); setLoading(false); return; }
    if (!regName.trim()) { setError('Nama pemilik wajib diisi.'); setLoading(false); return; }
    if (!regShop.trim()) { setError('Nama usaha/toko wajib diisi.'); setLoading(false); return; }

    const sessionData = {
      nama_pemilik: regName.trim(),
      nama_usaha: regShop.trim(),
      no_wa: rawWA,
      kategori: regCategory,
    };

    saveSession(sessionData);

    // Simpan ke Supabase leads (tidak blocking — jika gagal tetap lanjut)
    try {
      await supabase.from('leads').insert([{
        nama_pemilik: sessionData.nama_pemilik,
        nama_usaha: sessionData.nama_usaha,
        no_wa: sessionData.no_wa,
        kategori: sessionData.kategori,
        status: 'New Lead',
      }]);
    } catch (_) {}

    setLoading(false);
    setStep('success');
    setTimeout(() => {
      window.location.href = '/member';
    }, 1000);
  };

  const saveSession = (data: any) => {
    try {
      localStorage.setItem('wa_member_session', JSON.stringify(data));
      localStorage.setItem('ubos_lead', JSON.stringify({
        owner_name: data.nama_pemilik || '',
        nama_usaha: data.nama_usaha || '',
        whatsapp: data.no_wa || '',
        kategori_usaha: data.kategori || 'Kuliner & F&B',
      }));
    } catch (_) {}
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-5 justify-center">
      <div className="w-full max-w-sm mx-auto space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <img src="/assets/images/logo-logaritma.png" alt="Logaritma" className="w-10 h-10 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-black text-slate-800 tracking-tight text-2xl">LOGARITMA.ID</span>
            <span className="text-[11px] font-bold text-blue-600 tracking-wide">Member Area</span>
          </div>
        </div>

        {/* ── STEP: SUCCESS ──────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-3">
            <CheckCircle2 size={52} className="text-emerald-500 mx-auto" />
            <p className="font-black text-slate-800 text-xl">Berhasil!</p>
            <p className="text-sm text-slate-500">Mengalihkan ke Member Area...</p>
          </div>
        )}

        {/* ── STEP: LOGIN (cek nomor WA) ─────────────────────────────────── */}
        {step === 'login' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div>
              <h1 className="text-xl font-black text-slate-800">Akses Member Area</h1>
              <p className="text-sm text-slate-500 mt-1">Masukkan nomor WhatsApp yang Anda daftarkan</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">⚠️ {error}</div>
            )}

            <form onSubmit={handleCheckWA} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={loginWA}
                    onChange={e => setLoginWA(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="08123456789"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2"
              >
                {loading
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Masuk ke Member Area</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <div className="pt-1 border-t border-slate-100 text-center">
              <a href="/auth?mode=login" className="text-xs text-blue-600 font-semibold hover:underline">
                Punya akun UBOS dengan password? Login di sini →
              </a>
            </div>
          </div>
        )}

        {/* ── STEP: REGISTER (nomor WA tidak ditemukan) ─────────────────── */}
        {step === 'register' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 mb-3">
                📋 Nomor baru — lengkapi data Anda
              </div>
              <h2 className="text-lg font-black text-slate-800">Isi Data Usaha</h2>
              <p className="text-sm text-slate-500 mt-1">
                Nomor WA ini belum terdaftar. Lengkapi data berikut untuk masuk.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">⚠️ {error}</div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nama Pemilik */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Pemilik</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Budi Santoso" autoFocus
                  />
                </div>
              </div>

              {/* Nama Usaha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Usaha / Toko</label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text" required value={regShop} onChange={e => setRegShop(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Warung Makan Sari"
                  />
                </div>
              </div>

              {/* Nomor WA (pre-filled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel" required value={regWA} onChange={e => setRegWA(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kategori Usaha</label>
                <div className="relative">
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={regCategory} onChange={e => setRegCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option>Kuliner & F&B</option>
                    <option>Toko & Ritel</option>
                    <option>Laundry & Jasa</option>
                    <option>Salon & Kecantikan</option>
                    <option>Konter & Elektronik</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2"
              >
                {loading
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Simpan & Masuk</span><ArrowRight size={16} /></>}
              </button>

              <button
                type="button"
                onClick={() => { setStep('login'); setError(null); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 py-1 transition-colors"
              >
                ← Kembali, ganti nomor WA
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
