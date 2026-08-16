'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          
          let expiresDate = new Date();
          if (merchantData.trial_expires_at) {
            expiresDate = new Date(merchantData.trial_expires_at);
          } else if (merchantData.created_at) {
            expiresDate = new Date(merchantData.created_at);
            expiresDate.setDate(expiresDate.getDate() + 7);
          }
          const diff = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(diff);
        }
      }

      setLoading(false);
      if (!session && !pathname?.startsWith('/auth') && pathname !== '/' && !pathname?.startsWith('/member') && pathname !== '/admin' && !pathname?.startsWith('/investor') && !pathname?.startsWith('/store')) {
        router.push('/');
      } else if (session && pathname?.startsWith('/auth')) {
        router.push('/member');
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
          setTrialDaysLeft(diff);
        }
      } else {
        // Reset to default
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--primary-dark');
      }
      if (!newSession && !pathname?.startsWith('/auth') && pathname !== '/' && !pathname?.startsWith('/member') && pathname !== '/admin' && !pathname?.startsWith('/investor') && !pathname?.startsWith('/store')) {
        router.push('/');
      } else if (newSession && pathname?.startsWith('/auth')) {
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
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');
  const isInvestorPage = pathname?.startsWith('/investor');
  const isMemberArea = pathname?.startsWith('/member');
  const isStorefrontPage = pathname?.startsWith('/store');
  const isSubPage = pathname?.includes('/new') || pathname?.includes('/edit') || pathname?.includes('/settings');
  const hideSidebar = isAuthPage || isAdminPage || isLandingPage || isMemberArea || isInvestorPage || isStorefrontPage;

  if (isAdminPage) {
    return <>{children}</>;
  }

  if (isLandingPage || isInvestorPage || isAuthPage || isMemberArea || isStorefrontPage) {
    return <main className="w-full min-h-[100dvh] bg-slate-50">{children}</main>;
  }

  const isBillingPage = pathname?.includes('/billing');
  const showWarningBanner = trialDaysLeft !== null && trialDaysLeft <= 14 && trialDaysLeft > 0 && !isBillingPage && merchant?.status !== 'Premium';

  return (
    <div className="w-full h-[100dvh] bg-slate-50 flex mx-auto max-w-md md:max-w-none md:mx-0 relative shadow-2xl md:shadow-none overflow-hidden">
      
      {!hideSidebar && <TopBar merchant={merchant} onOpenSidebar={() => setIsSidebarOpen(true)} />}
      
      {/* Mobile Sidebar Overlay */}
      {!hideSidebar && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[70] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!hideSidebar && (
        <div className={`fixed inset-y-0 left-0 z-[80] md:z-50 transform md:transform-none transition-transform duration-300 md:relative md:flex ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Sidebar merchant={merchant} onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}
      
      <main className={`flex-1 overflow-y-auto hide-scrollbar relative w-full flex flex-col pt-16 ${!hideSidebar ? 'md:pl-0' : ''} ${showWarningBanner ? 'pb-40 md:pb-28' : 'pb-6'}`}>
        <div className="flex-1">
          {children}
        </div>
        
        {/* Sticky Warning Banner */}
        {showWarningBanner && (
          <div className="fixed bottom-0 left-0 md:left-64 right-0 z-[60] bg-white text-slate-800 px-4 py-4 md:py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-center gap-4 md:gap-6 animate-in slide-in-from-bottom-2 border-t border-slate-200">
            <div className="flex flex-col text-center md:text-left gap-1 max-w-3xl">
              <span className="font-bold text-sm text-slate-900">Masa Aktif akun trial tersisa {trialDaysLeft} hari Segera beli langganan sebelum masa trial berakhir untuk mendapatkan diskon berlangganan hingga 35%</span>
            </div>
            <button 
              onClick={() => {
                const categoryRaw = merchant?.kategori_usaha || 'kuliner';
                const category = encodeURIComponent(categoryRaw.toLowerCase().split(' ')[0] || 'kuliner');
                const slug = merchant?.nama_usaha ? merchant.nama_usaha.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
                router.push(`/ubos/${category}/${slug}/billing`);
              }}
              className="w-full md:w-auto bg-[#e12530] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-md whitespace-nowrap hover:bg-rose-700 transition-colors active:scale-95 shrink-0"
            >
              Perpanjang
            </button>
          </div>
        )}
      </main>
      
      {/* Bottom Nav removed completely as per Majoo UI design preference */}
    </div>
  );
}
