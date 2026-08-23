'use client';

import { useEffect, useState } from 'react';

export default function MemberCacheClearPage() {
  const [status, setStatus] = useState('Membersihkan data versi lama...');

  useEffect(() => {
    const clearAndRedirect = async () => {
      try {
        // Step 1: Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }

        // Step 2: Clear ALL browser caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        }

        setStatus('Berhasil! Mengalihkan...');

        // Step 3: Force navigate to homepage bypassing any cache
        // Use location.replace so there's no back-button loop
        setTimeout(() => {
          window.location.replace('/');
        }, 800);
      } catch (err) {
        // Fallback: just go home
        window.location.replace('/');
      }
    };

    // Small delay to ensure page has rendered before running
    const timer = setTimeout(clearAndRedirect, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mb-6"></div>
      <h1 className="text-2xl font-black mb-2">Memperbarui Sistem...</h1>
      <p className="text-slate-400">{status}</p>
      <p className="text-slate-600 text-sm mt-4">Halaman ini hanya muncul sekali untuk membersihkan cache lama.</p>
    </div>
  );
}
