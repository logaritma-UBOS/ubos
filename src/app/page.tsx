'use client';

import { useEffect, useState } from 'react';
import LandingPageUBOS from '@/components/LandingPageUBOS';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      
      if (data?.user) {
        supabase.from('merchants').select('*').eq('user_id', data.user.id).maybeSingle()
          .then(({ data: merchantData }) => {
            if (!isMounted) return;
            
            if (merchantData) {
              const catRaw = merchantData.kategori_usaha || 'kuliner';
              const category = encodeURIComponent(catRaw.toLowerCase().split(' ')[0] || 'kuliner');
              const slug = merchantData.nama_usaha ? merchantData.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : merchantData.id || 'merchant';
              router.push(`/ubos/${category}/${slug}`);
            } else {
              router.push('/ubos/kuliner/merchant');
            }
          });
      } else {
        setLoading(false);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Render a blank screen briefly while checking auth to avoid flickering the landing page
  if (loading) return null;

  return <LandingPageUBOS />;
}
