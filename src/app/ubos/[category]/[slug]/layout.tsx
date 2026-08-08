'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Store } from 'lucide-react';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(`Silakan login dengan Nomor WhatsApp dan Password terdaftar untuk mengakses modul ini.`);
        router.push('/auth');
        return;
      }

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('nama_usaha, status, expired_at, created_at, trial_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantData) {
        if (params.slug) {
          const expectedSlug = (merchantData.nama_usaha || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          if (expectedSlug !== params.slug) {
            router.push(`/ubos/${params.category || 'kuliner'}/${expectedSlug}`);
            return;
          }
        }

        // Cek masa aktif
        let expiresDate = new Date();
        const merchantStatus = merchantData.status || 'Trial';
        
        if (merchantStatus === 'Premium' && merchantData.expired_at) {
          expiresDate = new Date(merchantData.expired_at);
        } else if (merchantData.trial_expires_at) {
          expiresDate = new Date(merchantData.trial_expires_at);
        } else if (merchantData.created_at) {
          expiresDate = new Date(merchantData.created_at);
          expiresDate.setDate(expiresDate.getDate() + 7);
        }
        
        const now = new Date();
        const diff = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diff <= 0) {
          toast.error("Masa aktif habis. Silakan perpanjang lisensi Anda.");
          router.push('/member?expired=true');
          return;
        }
      }

      if (isMounted) setAuthorized(true);
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [router, params]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-500 animate-pulse bg-slate-50">
        <Store size={48} className="mb-4 text-blue-200" />
        <p>Memverifikasi Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}
