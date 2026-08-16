'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, Store, ArrowRight, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [namaUsaha, setNamaUsaha] = useState('');
  const [kategoriUsaha, setKategoriUsaha] = useState('Kuliner & F&B');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUsaha.trim() || !whatsapp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const rawWA = whatsapp.replace(/\D/g, '');
      if (rawWA.length < 10) throw new Error('Nomor WhatsApp tidak valid. Minimal 10 digit.');
      
      let normalWA = rawWA;
      if (rawWA.startsWith('0')) normalWA = '62' + rawWA.slice(1);
      else if (rawWA.startsWith('8')) normalWA = '62' + rawWA;

      // 7 days from now
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Check if already registered
      const { data: existing } = await supabase.from('merchants').select('id').eq('whatsapp', normalWA).maybeSingle();
      if (existing) {
        throw new Error('Nomor WhatsApp sudah terdaftar. Silakan langsung Masuk.');
      }

      // Insert new merchant directly (bypassing Auth since it's frictionless)
      const { data, error: insertError } = await supabase.from('merchants').insert([{
        nama_usaha: namaUsaha.trim(),
        kategori_usaha: kategoriUsaha,
        whatsapp: normalWA,
        status: 'Trial',
        trial_expires_at: trialEndsAt
      }]).select().single();

      if (insertError) throw insertError;

      // Save session data
      const sessionData = {
        nama_pemilik: '', 
        nama_usaha: namaUsaha.trim(),
        no_wa: normalWA,
        kategori: kategoriUsaha,
      };
      localStorage.setItem('wa_member_session', JSON.stringify(sessionData));

      // Generate slug and redirect
      const categoryRaw = kategoriUsaha;
      const category = encodeURIComponent(categoryRaw.toLowerCase().split(' ')[0] || 'kuliner');
      const slug = namaUsaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      router.push(`/ubos/${category}/${slug}`);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat pendaftaran.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4 items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner mb-2">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">Mulai Trial Gratis</h1>
          <p className="text-sm text-slate-500 text-center px-4">
            Buat akun toko Anda dalam 30 detik. Tidak perlu kartu kredit.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2 font-medium">
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Nama Usaha / Toko</label>
            <div className="relative">
              <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={namaUsaha}
                onChange={e => setNamaUsaha(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                placeholder="Misal: Kopi Senja"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Kategori Usaha</label>
            <div className="relative">
              <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                required
                value={kategoriUsaha}
                onChange={e => setKategoriUsaha(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
              >
                <option value="Kuliner & F&B">Kuliner & F&B</option>
                <option value="Toko & Ritel">Toko & Ritel</option>
                <option value="Percetakan">Percetakan & Desain</option>
                <option value="Jasa & Servis">Jasa & Servis</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Nomor WhatsApp Aktif</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                placeholder="Contoh: 08123456789"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading
                ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Buat Toko Sekarang</span><ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

        <div className="text-center pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-black text-emerald-600 hover:text-emerald-700 transition-colors">
              Masuk ke Toko
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
