'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Store, Mail, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanWA = whatsapp.replace(/\D/g, '');
      if (cleanWA.length < 10) throw new Error('Nomor WhatsApp tidak valid.');
      const dummyEmail = `${cleanWA}@logaritma.id`;

      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        if (error) throw error;
        
        // Fetch merchant to redirect
        if (data.user) {
          const { data: merchantData } = await supabase.from('merchants').select('nama_usaha, kategori_usaha').eq('user_id', data.user.id).maybeSingle();
          if (merchantData) {
            const category = (merchantData.kategori_usaha || 'kuliner').toLowerCase().split(' ')[0] || 'kuliner';
            const slug = (merchantData.nama_usaha || 'merchant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
            return;
          }
        }
        router.push('/member');
      } else {
        const { data, error } = await supabase.auth.signUp({ email: dummyEmail, password });
        if (error) throw error;
        
        const categoryParam = searchParams.get('category') || 'F&B';
        
        // After signup, create merchant profile if user is created
        if (data.user) {
          const { error: profileError } = await supabase
            .from('merchants')
            .insert([{
              user_id: data.user.id,
              nama_usaha: merchantName,
              kategori_usaha: categoryParam,
              whatsapp: cleanWA
            }]);
            
          if (profileError) {
             console.error('Error creating merchant:', profileError);
             throw new Error(`Gagal membuat profil toko: ${profileError.message || profileError.details || 'Unknown Error'}`);
          }
          
          const category = categoryParam.toLowerCase().split(' ')[0] || 'kuliner';
          const slug = merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 justify-center bg-slate-50">
      <div className="w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo-ubos.png" alt="UBOS Logo" className="w-40 object-contain" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nama Usaha / Toko</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Store size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                  placeholder="Kopi Senja"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nomor WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                placeholder="08123456789"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] mt-2 disabled:opacity-70 flex justify-center items-center shadow-sm shadow-primary/30"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Masuk ke Dashboard' : 'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-slate-500 hover:text-primary font-medium transition-colors"
          >
            {isLogin ? 'Belum punya akun? Daftar gratis' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
