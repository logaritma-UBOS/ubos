'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let cleanWA = normalizePhone(whatsapp);
      if (cleanWA.length < 10) throw new Error('Nomor WhatsApp tidak valid. Minimal 10 digit.');
      
      const dummyEmail = `${cleanWA}@logaritma.id`;

      let signInError = null;
      let data = null;
      
      // Try login with 62...
      const res = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
      signInError = res.error;
      data = res.data;

      // Fallback: If failed, try legacy login with 08...
      if (signInError && whatsapp.replace(/\D/g, '').startsWith('0')) {
        const rawWA = whatsapp.replace(/\D/g, '');
        const legacyDummyEmail = `${rawWA}@logaritma.id`;
        const legacyRes = await supabase.auth.signInWithPassword({ email: legacyDummyEmail, password });
        if (!legacyRes.error) {
          signInError = null;
          data = legacyRes.data;
        }
      }

      // Fallback 2: Check leads table
      if (signInError) {
        let leadData = null;
        const { data: exactLead } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).eq('password_session', password).maybeSingle();
        
        if (exactLead) {
          leadData = exactLead;
        } else {
          const { data: anyLead } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).maybeSingle();
          if (anyLead && !anyLead.password_session) {
            leadData = anyLead;
          }
        }

        if (leadData) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: dummyEmail,
            password,
          });
          
          if (signUpError) throw new Error('Gagal memigrasi akun: ' + signUpError.message);
          
          if (signUpData.user) {
            await supabase.from('merchants').insert([{
              user_id: signUpData.user.id,
              nama_usaha: leadData.nama_usaha,
              kategori_usaha: leadData.kategori || 'kuliner',
              whatsapp: cleanWA,
            }]);
            
            signInError = null;
            data = signUpData;
          }
        }
      }

      if (signInError) throw new Error('Nomor WA atau password salah. Silakan coba lagi.');

      if (data?.user) {
        // Biarkan /member resolver yang melakukan validasi dan redirect ke /ubos/...
        router.push('/member');
        return;
      }
      
      router.push('/member');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Masuk Akun">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

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
              placeholder="Masukkan password Anda"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>

        <div className="text-center pt-4 border-t border-slate-100 mt-6">
          <p className="text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link href="/auth/daftar" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
