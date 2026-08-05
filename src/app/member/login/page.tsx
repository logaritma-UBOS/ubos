'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Alur 1: Login Member Area — hanya dengan Nomor WhatsApp ──────────────
function MemberLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanWA = whatsapp.replace(/\D/g, '');
      if (cleanWA.length < 10) throw new Error('Nomor WhatsApp tidak valid. Minimal 10 digit.');

      // Cek nomor WA di tabel leads
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('nama_pemilik, nama_usaha, no_wa, kategori, status')
        .eq('no_wa', cleanWA)
        .maybeSingle();

      if (leadError) throw new Error('Gagal memeriksa data. Silakan coba lagi.');

      if (!leadData) {
        // Coba juga cari di tabel waiting_list (format lama)
        const { data: waitingData } = await supabase
          .from('waiting_list')
          .select('nama_usaha, whatsapp, kategori_usaha')
          .eq('whatsapp', cleanWA)
          .maybeSingle();

        if (!waitingData) {
          throw new Error(
            'Nomor WhatsApp ini belum terdaftar. Silakan isi formulir pendaftaran terlebih dahulu di halaman utama.'
          );
        }

        // Simpan sesi dari waiting_list
        const sessionData = {
          nama_usaha: waitingData.nama_usaha,
          no_wa: waitingData.whatsapp,
          kategori: waitingData.kategori_usaha || 'Kuliner & F&B',
        };
        localStorage.setItem('wa_member_session', JSON.stringify(sessionData));
        localStorage.setItem('ubos_lead', JSON.stringify({
          nama_usaha: waitingData.nama_usaha,
          whatsapp: waitingData.whatsapp,
          kategori_usaha: waitingData.kategori_usaha,
        }));
      } else {
        // Simpan sesi dari leads
        const sessionData = {
          nama_pemilik: leadData.nama_pemilik,
          nama_usaha: leadData.nama_usaha,
          no_wa: leadData.no_wa,
          kategori: leadData.kategori,
          status: leadData.status,
        };
        localStorage.setItem('wa_member_session', JSON.stringify(sessionData));
        localStorage.setItem('ubos_lead', JSON.stringify({
          owner_name: leadData.nama_pemilik,
          nama_usaha: leadData.nama_usaha,
          whatsapp: leadData.no_wa,
          kategori_usaha: leadData.kategori,
        }));
      }

      setSuccess(true);
      setTimeout(() => {
        const category = searchParams.get('category') || '';
        router.push(`/member${category ? `?category=${category}` : ''}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 justify-center">
      <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="text-center space-y-3">
          <img src="/logo-ubos.png" alt="UBOS Logo" className="w-32 mx-auto object-contain" />
          <div>
            <h1 className="text-xl font-black text-slate-800">Akses Member Area</h1>
            <p className="text-slate-500 text-sm mt-1">
              Masuk dengan nomor WhatsApp yang Anda daftarkan
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">

          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <p className="font-bold text-slate-800">Berhasil! Mengalihkan...</p>
              <p className="text-sm text-slate-500">Selamat datang di Member Area Anda</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="08123456789"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Gunakan nomor yang sama saat mengisi formulir pendaftaran
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Masuk ke Member Area <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Divider info */}
        <div className="text-center space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-blue-700">Punya akun UBOS (dengan password)?</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Langsung masuk ke dashboard bisnis lengkap Anda dengan WhatsApp + password.
            </p>
            <a
              href="/auth?mode=login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login ke Dashboard UBOS <ArrowRight size={12} />
            </a>
          </div>

          <p className="text-xs text-slate-400">
            Belum isi formulir pendaftaran?{' '}
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Daftar Gratis di sini
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>}>
      <MemberLoginForm />
    </Suspense>
  );
}
