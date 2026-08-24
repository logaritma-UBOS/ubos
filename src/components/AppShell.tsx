'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import UBOSLoading from './UBOSLoading';

// ─── Public routes that do NOT need auth/session check ──────────────────────
// These pages render immediately with no Supabase calls, no Set-Cookie headers,
// making the HTML eligible for Vercel Edge Cache (X-Vercel-Cache: HIT).
const isPublicPath = (pathname: string) =>
  pathname === '/' ||
  pathname.startsWith('/backward-mapping') ||
  pathname.startsWith('/investor') ||
  pathname.startsWith('/member');

// ─── Lazy-load heavy app-only components ────────────────────────────────────
// These are NEVER rendered on public/landing pages.
// ssr:false excludes their code from the server bundle and homepage chunk.
const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });
const BottomNav = dynamic(() => import('./BottomNav'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ── Public page fast-path ────────────────────────────────────────────────
  // Skip auth check entirely — renders synchronously, no spinner, no Supabase.
  if (isPublicPath(pathname)) {
    return <main className="w-full min-h-[100dvh] bg-slate-50">{children}</main>;
  }

  // ── App pages: render the full authenticated shell ───────────────────────
  // Suspense boundary is required because AppShellInner uses useSearchParams()
  return (
    <Suspense fallback={<UBOSLoading fullScreen={false} show={true} />}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

// ─── Inner shell — only mounted for authenticated app routes ─────────────────
// Supabase is imported at the top of this module but because AppShell does an
// early return for public paths, webpack can still tree-shake these imports
// from the homepage chunk when using dynamic() boundaries.
import { supabase } from '@/lib/supabase/client';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const ipRef = useRef<string>('Unknown');

  // 1. Initialization Effect
  useEffect(() => {
    let isMounted = true;

    // Fetch IP once
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.ip) {
          ipRef.current = data.ip;
        }
      })
      .catch(() => {});

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
        }
      }

      setLoading(false);
      
      const currentPath = window.location.pathname;
      if (!session && currentPath !== '/auth' && currentPath !== '/' && !currentPath.startsWith('/backward-mapping') && !currentPath.startsWith('/member') && currentPath !== '/admin' && !currentPath.startsWith('/investor')) {
        router.push('/');
      } else if (session && (currentPath === '/auth')) {
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
        if (diff <= 0 && (currentPath.startsWith('/ubos') || currentPath.startsWith('/pos'))) {
          router.push('/member?expired=true');
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, newSession: any) => {
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

          let expiresDate = new Date();
          if (merchantData.trial_expires_at) {
            expiresDate = new Date(merchantData.trial_expires_at);
          } else if (merchantData.created_at) {
            expiresDate = new Date(merchantData.created_at);
            expiresDate.setDate(expiresDate.getDate() + 7);
          }
          const diff = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const currentPath = window.location.pathname;
          if (diff <= 0 && (currentPath.startsWith('/ubos') || currentPath.startsWith('/pos'))) {
            router.push('/member?expired=true');
          }
        }
      } else {
        // Reset to default
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--primary-dark');
      }
      
      const currentPath = window.location.pathname;
      if (!newSession && currentPath !== '/auth' && currentPath !== '/' && !currentPath.startsWith('/backward-mapping') && !currentPath.startsWith('/member') && currentPath !== '/admin' && !currentPath.startsWith('/investor')) {
        router.push('/');
      } else if (newSession && (currentPath === '/auth')) {
        router.push('/member');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // 2. Navigation Tracking Effect
  useEffect(() => {
    if (session?.user?.id) {
      supabase.from('merchants').update({
        last_active_at: new Date().toISOString(),
        current_page: pathname,
        ip_address: ipRef.current,
        device_info: navigator.userAgent
      }).eq('user_id', session.user.id).then();
    }
  }, [pathname, session]);

  // 3. Navigation UI Feedback
  const [isNavigating, setIsNavigating] = useState(false);
  const searchParams = useSearchParams();

  // Clear navigating state when route changes finish
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a');
      if (target && target.href) {
        const url = new URL(target.href);
        // Only trigger loader for internal paths that are different
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsNavigating(true);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (loading) {
    return (
      <UBOSLoading fullScreen={false} show={true} />
    );
  }

  const isAuthPage = pathname === '/auth';
  const isAdminPage = pathname.startsWith('/admin');
  const isSubPage = pathname.includes('/new') || pathname.includes('/edit') || pathname.includes('/settings');
  const hideBottomNav = isAuthPage || isSubPage || isAdminPage;
  const hideSidebar = isAuthPage || isAdminPage;

  return (
    <div className="w-full min-h-[100dvh] bg-slate-50 flex mx-auto max-w-md md:max-w-none md:mx-0 relative shadow-2xl md:shadow-none overflow-hidden">
      <UBOSLoading fullScreen={true} show={isNavigating} delayMs={150} />
      
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
