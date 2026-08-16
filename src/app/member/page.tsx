'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const fetchAndRedirect = async () => {
      // 1. Cek Frictionless Session (LocalStorage)
      try {
        const waSession = localStorage.getItem('wa_member_session');
        if (waSession) {
          const sessionData = JSON.parse(waSession);
          if (sessionData && sessionData.no_wa && sessionData.nama_usaha) {
            const categoryRaw = sessionData.kategori || 'kuliner';
            const categorySafe = categoryRaw === 'undefined' ? 'kuliner' : categoryRaw;
            const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
            
            const slug = sessionData.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            router.replace(`/ubos/${category}/${slug}`);
            return;
          }
        }
      } catch (err) {
        console.error('Error reading localStorage session:', err);
      }

      // 2. Fallback: Cek Supabase Auth Session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (merchantData && isMounted) {
          const catRaw = merchantData.kategori_usaha || merchantData.kategori || 'kuliner';
          const categorySafe = catRaw === 'undefined' ? 'kuliner' : catRaw;
          const category = encodeURIComponent(categorySafe.toLowerCase().split(' ')[0] || 'kuliner');
          
          const expectedSlug = merchantData.nama_usaha 
            ? merchantData.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
            : merchantData.id || merchantData.whatsapp;
            
          router.replace(`/ubos/${category}/${expectedSlug}`);
          return;
        }
      }

      // 3. Jika tidak ada sesi aktif sama sekali, arahkan ke halaman Login baru
      router.push('/login');
    };

    fetchAndRedirect();

    return () => { isMounted = false; };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center max-w-md w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Store className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Memuat Dashboard...</h1>
        <p className="text-slate-500 font-medium mb-8">Menyiapkan workspace Logaritma UBOS Anda.</p>
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    </div>
  );
}
