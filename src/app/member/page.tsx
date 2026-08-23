'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberCacheClearPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }

    // 2. Clear caches to remove the old PWA assets
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }

    // 3. Force a hard reload to the homepage to grab the latest non-cached version
    setTimeout(() => {
      window.location.href = '/?clear_cache=true';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-6"></div>
      <h1 className="text-2xl font-black mb-2">Memperbarui Sistem...</h1>
      <p className="text-slate-400">Harap tunggu sebentar, kami sedang membersihkan data versi lama.</p>
    </div>
  );
}
