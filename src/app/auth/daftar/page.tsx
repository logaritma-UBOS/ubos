'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, Lock, Store, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';

function normalizePhone(phone: string) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      let cleanWA = normalizePhone(whatsapp);
      if (cleanWA.length < 10) throw new Error('Nomor WhatsApp tidak valid. Minimal 10 digit.');
      
      const dummyEmail = `${cleanWA}@logaritma.id`;
      const categoryParam = searchParams?.get('category') || 'Kuliner & F&B';
      
      // 1. Panggil API untuk insert ke leads & kirim WA Fonnte
      const res = await fetch('/api/leads/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_usaha: merchantName,
          no_wa: cleanWA,
          kategori: categoryParam,
          password: password,
          funnel_destination: 'UBOS'
        })
      });

      let result;
      try {
        const textRes = await res.text();
        result = JSON.parse(textRes);
      } catch (err) {
        throw new Error('Terjadi kesalahan pada sistem pendaftaran.');
      }

      if (!res.ok || !result.success) {
        throw new Error(result?.error || 'Gagal mendaftar. Silakan coba lagi.');
      }

      if (!result.isNew) {
        toast.info('Nomor WhatsApp ini sudah terdaftar. Silakan login.');
        router.push('/auth/login');
        return;
      }

      // 2. Insert user to Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: password,
      });

      if (signUpError) {
        throw new Error('Gagal mendaftarkan akun: ' + signUpError.message);
      }

      if (data?.user) {
        // 3. Create merchant profile
        const insertData = {
          user_id: data.user.id,
          nama_usaha: merchantName,
          whatsapp: cleanWA,
          kategori_usaha: categoryParam,
          status: 'Trial',
          created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase.from('merchants').insert([insertData]);
        
        if (insertError) {
          console.error("Gagal membuat profil merchant:", insertError);
        }

        const category = categoryParam.toLowerCase().split(' ')[0];
        const slug = merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        toast.success('Pendaftaran berhasil! Mengalihkan ke Dashboard...');
        setTimeout(() => {
          router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
        }, 1500);
      } else {
        router.push('/member');
      }

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Daftar Akun">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Nama Bisnis / Usaha</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Store className="h-5 w-5" />
            </div>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-colors"
              placeholder="Contoh: Toko Kopi Logaritma"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Phone className="h-5 w-5" />
            </div>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-colors"
              placeholder="Contoh: 0812 3456 7890"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition-colors"
              placeholder="Buat password untuk login"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-start gap-3">
          <div className="flex items-center h-5 mt-1">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
          <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            Dengan mendaftar, saya menyatakan telah membaca dan menyetujui <span className="text-emerald-600 font-medium">Ketentuan Layanan</span> & <span className="text-emerald-600 font-medium">Kebijakan Privasi</span> UBOS.
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-300 hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-70 transition-all duration-200"
            style={agreed && !loading ? { backgroundImage: 'linear-gradient(to right, #10b981, #14b8a6)', backgroundColor: 'transparent' } : {}}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              'Daftar'
            )}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-slate-100 mt-6">
          <p className="text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
