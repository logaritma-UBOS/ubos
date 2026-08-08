'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Store, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// ─── Alur 2: Login ke UBOS App (WA + Password) ────────────────────────────

function normalizePhone(phone: string) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'register') setIsRegister(true);
    else if (searchParams.get('mode') === 'login') setIsRegister(false);
  }, [searchParams]);

  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkExistingPhone = async (phone: string) => {
    if (!phone) return;
    const rawWA = normalizePhone(phone);
    if (rawWA.length < 10) return;

    try {
      const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(rawWA)}`);
      const result = await res.json();

      if (result.found) {
        setIsRegister(false);
        setMerchantName(result.nama_usaha || '');
        toast.info('Nomor WA terdaftar. Silakan masukkan password Anda.', { id: 'auto-login' });
      }
    } catch (e) {
      // fail silently
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let cleanWA = normalizePhone(whatsapp);
      if (cleanWA.length < 10) throw new Error('Nomor WhatsApp tidak valid. Minimal 10 digit.');
      
      const dummyEmail = `${cleanWA}@logaritma.id`;

      if (!isRegister) {
        // ── LOGIN: WA + Password ──────────────────────────────────────────
        let signInError = null;
        let data = null;
        
        // Coba login dengan format 62...
        const res = await supabase.auth.signInWithPassword({ email: dummyEmail, password });
        signInError = res.error;
        data = res.data;

        // Fallback: Jika gagal dan user memasukkan 08..., coba login dengan 08... (legacy support)
        if (signInError && whatsapp.replace(/\D/g, '').startsWith('0')) {
          const rawWA = whatsapp.replace(/\D/g, '');
          const legacyDummyEmail = `${rawWA}@logaritma.id`;
          const legacyRes = await supabase.auth.signInWithPassword({ email: legacyDummyEmail, password });
          if (!legacyRes.error) {
            signInError = null;
            data = legacyRes.data;
          }
        }

        // Fallback 2: Check leads table (jika user baru daftar via Landing Page tapi belum punya auth account)
        if (signInError) {
          let leadData = null;
          const { data: exactLead } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).eq('password_session', password).maybeSingle();
          
          if (exactLead) {
            leadData = exactLead;
          } else {
            // Coba ambil berdasarkan WA saja jika migration SQL belum dijalankan (password_session = null)
            const { data: anyLead } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).maybeSingle();
            if (anyLead && !anyLead.password_session) {
              leadData = anyLead; // Izinkan bypass hanya jika password_session belum pernah tersimpan
            }
          }

          if (leadData) {
            // Auto-create auth account from lead
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: dummyEmail,
              password,
            });
            
            if (signUpError) throw new Error('Gagal memigrasi akun dari pendaftaran awal: ' + signUpError.message);
            
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

        if (data.user) {
          const { data: merchantData } = await supabase
            .from('merchants')
            .select('nama_usaha, kategori_usaha')
            .eq('user_id', data.user.id)
            .maybeSingle();

          let category = 'kuliner';
          let slug = 'merchant';

          if (merchantData) {
            category = (merchantData.kategori_usaha || 'kuliner').toLowerCase().split(' ')[0];
            slug = (merchantData.nama_usaha || 'merchant')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '');
          } else {
            // Re-create merchant record if it's missing but user has valid auth
            const { data: lead } = await supabase.from('leads').select('*').eq('no_wa', cleanWA).maybeSingle();
            if (lead) {
              const insertData = {
                user_id: data.user.id,
                nama_usaha: lead.nama_usaha || 'Toko Baru',
                whatsapp: cleanWA,
                kategori_usaha: lead.kategori || 'Kuliner & F&B',
                status: 'Trial',
                created_at: new Date().toISOString()
              };
              await supabase.from('merchants').insert([insertData]);
              category = (lead.kategori || 'kuliner').toLowerCase().split(' ')[0];
              slug = (lead.nama_usaha || 'merchant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            } else {
              router.push('/member');
              return;
            }
          }
          
          router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
          return;
        }
        router.push('/member');
      } else {
        // ── REGISTER: Buat akun UBOS App ─────────────────────────────────
        const categoryParam = searchParams.get('category') || 'Kuliner & F&B';
        
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
        } catch (e) {
          throw new Error('Terjadi kesalahan pada sistem pendaftaran.');
        }

        if (!res.ok || !result.success) {
          throw new Error(result?.error || 'Gagal mendaftar. Silakan coba lagi.');
        }

        if (!result.isNew) {
          // User sudah ada di leads (Existing) -> Alihkan ke Tab Masuk
          toast.info('Nomor WhatsApp ini sudah terdaftar. Silakan login.');
          setIsRegister(false);
          return;
        }

        // 1.5 Kirim Notifikasi WA Fonnte
        try {
          const katSlug = categoryParam.toLowerCase().split(' ')[0].replace(/[^a-z]+/g, '');
          const merchantSlug = merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'dashboard';
          const dashboardUrl = `https://logaritma.id/ubos/${katSlug}/${merchantSlug}`;
          const welcomeMessage = `Selamat Datang di Logaritma UBOS! 🚀\n\nHai Kak dari ${merchantName}, pendaftaran akun Anda telah berhasil.\nBerikut adalah detail akun akses Anda:\n\n• Nama Usaha : ${merchantName}\n• Kategori   : ${categoryParam}\n• No WhatsApp: ${cleanWA}\n• Password   : ${password}\n\nSilakan klik link di bawah untuk langsung masuk ke Dashboard Bisnis Anda:\n${dashboardUrl}\n\nSimpan pesan ini agar Anda tidak lupa password akses Anda.\nTerimakasih dan selamat mengunci profit harian!`;
          
          const waRes = await fetch('/api/wa/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: cleanWA, message: welcomeMessage })
          });
          const waData = await waRes.json();
          if (!waRes.ok || !waData.success) {
            toast.warning(`Peringatan: Pesan WA gagal terkirim. Pastikan nomor ${cleanWA} terdaftar di WhatsApp.`, { duration: 8000 });
          }
        } catch (waErr) {
          console.error("Gagal mengirim WA:", waErr);
          toast.warning("Peringatan: Gagal terhubung ke server WhatsApp.");
        }

        // 2. Buat Auth User
        let authUser = null;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password,
        });

        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: dummyEmail,
              password,
            });

            if (signInError) {
              toast.info('Nomor WhatsApp ini sudah aktif. Silakan login.');
              setIsRegister(false);
              return;
            } else {
              authUser = signInData.user;
            }
          } else {
            throw new Error(signUpError.message);
          }
        } else {
          authUser = data.user;
        }

        if (authUser) {
          // Seamless upsert ke tabel merchants
          const { data: existingMerchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (existingMerchant) {
            await supabase.from('merchants').update({
              nama_usaha: merchantName,
              kategori_usaha: categoryParam,
              whatsapp: cleanWA,
            }).eq('id', existingMerchant.id);
          } else {
            const { error: profileError } = await supabase.from('merchants').insert([{
              user_id: authUser.id,
              nama_usaha: merchantName,
              kategori_usaha: categoryParam,
              whatsapp: cleanWA,
              status: 'Trial',
              created_at: new Date().toISOString()
            }]);
            if (profileError) throw new Error(`Gagal membuat profil toko: ${profileError.message}`);
          }
          
          supabase.from('leads').update({ status: 'Converted' }).eq('no_wa', cleanWA).then();

          const category = categoryParam.toLowerCase().split(' ')[0];
          const slug = merchantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          router.push(`/ubos/${encodeURIComponent(category)}/${slug}`);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-4 items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="text-center space-y-2">
          <img src="/logo-ubos.png" alt="UBOS Logo" className="w-36 mx-auto object-contain" />
          <p className="text-slate-500 text-sm">
            {isRegister
              ? 'Buat akun dan mulai kelola bisnis Anda'
              : 'Masuk ke dashboard bisnis Anda'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegister ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegister ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daftar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Nama Usaha — hanya saat register */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Usaha / Toko</label>
              <div className="relative">
                <Store size={16} className="absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="Kopi Senja"
                />
              </div>
            </div>
          )}

          {/* Nomor WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor WhatsApp</label>
            <div className="relative">
              <Phone size={16} className="absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="whatsapp"
                autoComplete="tel-national"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                onBlur={(e) => checkExistingPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="08123456789"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] mt-2 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? 'Buat Akun & Masuk' : 'Masuk ke Dashboard'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer link ke Member Area */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-400">
            Belum daftar tapi sudah isi formulir?{' '}
            <a href="/member" className="text-blue-600 font-semibold hover:underline">
              Cek Member Area →
            </a>
          </p>
          <p className="text-xs text-slate-400">
            Belum punya akun?{' '}
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Daftar dari halaman utama
            </a>
          </p>
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
