'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const pingActivity = async (userId: string) => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const ip = ipRes ? (await ipRes.json()).ip : 'Unknown';
        const deviceInfo = navigator.userAgent;
        
        await supabase.from('merchants').update({
          last_active_at: new Date().toISOString(),
          current_page: pathname,
          ip_address: ip,
          device_info: deviceInfo
        }).eq('user_id', userId);
      } catch (err) {
        // Silently fail for tracking ping
      }
    };


    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      
      setSession(session);
      let fetchedMerchant = null;
      
      if (session) {
        // Fetch dynamic brand color
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (merchantData) {
          fetchedMerchant = merchantData;
          setMerchant(merchantData);
          if (merchantData.brand_color) {
            document.documentElement.style.setProperty('--primary', merchantData.brand_color);
            document.documentElement.style.setProperty('--primary-dark', `color-mix(in srgb, ${merchantData.brand_color} 80%, black)`);
          }
          pingActivity(session.user.id);
        }
      }

      setLoading(false);
      if (!session && pathname !== '/auth' && pathname !== '/' && !pathname.startsWith('/member') && pathname !== '/admin' && !pathname.startsWith('/investor')) {
        router.push('/');
      } else if (session && pathname === '/auth') {
        router.push('/member');
      } else if (session && fetchedMerchant) {
        let expiresDate = new Date();
        if (fetchedMerchant.trial_expires_at) {
          expiresDate = new Date(fetchedMerchant.trial_expires_at);
        } else if (fetchedMerchant.created_at) {
          expiresDate = new Date(fetchedMerchant.created_at);
          expiresDate.setDate(expiresDate.getDate() + 7);
        }
        const diff = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 0 && (pathname.startsWith('/ubos') || pathname.startsWith('/pos'))) {
          router.push('/member?expired=true');
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      
      if (newSession) {
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', newSession.user.id)
          .maybeSingle();
          
        if (merchantData) {
          setMerchant(merchantData);
          if (merchantData.brand_color) {
            document.documentElement.style.setProperty('--primary', merchantData.brand_color);
            document.documentElement.style.setProperty('--primary-dark', `color-mix(in srgb, ${merchantData.brand_color} 80%, black)`);
          }
          pingActivity(newSession.user.id);
          
          let expiresDate = new Date();
          if (merchantData.trial_expires_at) {
            expiresDate = new Date(merchantData.trial_expires_at);
          } else if (merchantData.created_at) {
            expiresDate = new Date(merchantData.created_at);
            expiresDate.setDate(expiresDate.getDate() + 7);
          }
          const diff = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (diff <= 0 && (pathname.startsWith('/ubos') || pathname.startsWith('/pos'))) {
            router.push('/member?expired=true');
          }
        }
      } else {
        // Reset to default
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--primary-dark');
      }
      if (!newSession && pathname !== '/auth' && pathname !== '/' && !pathname.startsWith('/member') && pathname !== '/admin' && !pathname.startsWith('/investor')) {
        router.push('/');
      } else if (newSession && pathname === '/auth') {
        router.push('/member');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md flex-1 flex flex-col items-center justify-center min-h-[100dvh] bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-primary"></div>
      </div>
    );
  }

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/auth';
  const isAdminPage = pathname.startsWith('/admin');
  const isInvestorPage = pathname.startsWith('/investor');
  const isMemberArea = pathname.startsWith('/member');
  const isSubPage = pathname.includes('/new') || pathname.includes('/edit') || pathname.includes('/settings');
  const hideBottomNav = isAuthPage || isSubPage || isAdminPage || isLandingPage || isMemberArea || isInvestorPage;
  const hideSidebar = isAuthPage || isAdminPage || isLandingPage || isMemberArea || isInvestorPage;

  if (isLandingPage || isInvestorPage || isAuthPage || isMemberArea) {
    return <main className="w-full min-h-[100dvh] bg-slate-50">{children}</main>;
  }

  return (
    <div className="w-full min-h-[100dvh] bg-slate-50 flex mx-auto max-w-md md:max-w-none md:mx-0 relative shadow-2xl md:shadow-none overflow-hidden">
      
      {!hideSidebar && <Sidebar merchant={merchant} />}
      
      <main className={`flex-1 overflow-y-auto hide-scrollbar relative w-full ${!hideSidebar ? 'md:pl-64' : ''} ${!hideBottomNav ? 'pb-28 md:pb-0' : ''}`}>
        {children}
      </main>
      
      {!hideBottomNav && (
        <div className="md:hidden">
          <BottomNav merchant={merchant} />
        </div>
      )}
    </div>
  );
}
