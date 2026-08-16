'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, ArrowRight, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Membersihkan input dari spasi atau karakter khusus
      const cleanInput = identifier.trim();
      
      // Jika input hanya angka, asumsikan itu WhatsApp
      let phoneQuery = '';
      if (/^[\d]+$/.test(cleanInput.replace(/\D/g, ''))) {
        const rawWA = cleanInput.replace(/\D/g, '');
        let normalWA = rawWA;
        if (rawWA.startsWith('0')) normalWA = '62' + rawWA.slice(1);
        else if (rawWA.startsWith('8')) normalWA = '62' + rawWA;
        phoneQuery = `whatsapp.eq.${rawWA},whatsapp.eq.${normalWA}`;
      }

      // Generate expected slug form for comparison if it's text
      const expectedSlug = cleanInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Build query string
      let orQuery = `nama_usaha.ilike.%${cleanInput}%`; // Allow partial matching for slug/name
      if (phoneQuery) {
        orQuery = `${phoneQuery},${orQuery}`;
      }

      const { data, error: searchError } = await supabase
        .from('merchants')
        .select('*')
        .or(orQuery)
        .limit(1)
        .maybeSingle();

      if (searchError) throw searchError;

      if (data) {
        // Toko ditemukan! Simpan session
        const sessionData = {
          nama_pemilik: '', 
          nama_usaha: data.nama_usaha || '',
          no_wa: data.whatsapp || cleanInput,
          kategori: data.kategori_usaha || 'Kuliner & F&B',
        };
        
        localStorage.setItem('wa_member_session', JSON.stringify(sessionData));
        
        // Arahkan ke URL toko
        const categoryRaw = data.kategori_usaha || 'kuliner';
        const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
        const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
        
        const slug = data.nama_usaha 
          ? data.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
          : data.id || data.whatsapp;

        router.push(`/ubos/${category}/${slug}`);
      } else {
        // Toko tidak ditemukan
        setError('Toko belum terdaftar. Yuk coba gratis 7 hari!');
      }

    } catch (err: any) {
      setError('Terjadi kesalahan saat memverifikasi data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4 items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        
        <div className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner mb-2">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">Masuk ke Toko Anda</h1>
          <p className="text-sm text-slate-500 text-center">
            Masukkan Nomor WhatsApp terdaftar atau Nama Toko Anda untuk mengakses Dashboard.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl font-medium flex flex-col items-center justify-center text-center gap-2">
            <span>{error}</span>
            <button onClick={() => router.push('/register')} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-bold mt-1 text-xs">
              Daftar Trial Gratis 7 Hari
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Nomor WA / Nama Toko</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="Contoh: 08123456789 atau Kopi Senja"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading
              ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Masuk ke Dashboard Toko</span><ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            Belum punya toko?{' '}
            <Link href="/register" className="font-black text-blue-600 hover:text-blue-700 transition-colors">
              Daftar Trial Gratis
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
