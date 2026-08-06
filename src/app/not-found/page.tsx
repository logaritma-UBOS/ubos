export const dynamic = 'force-dynamic';

import React from 'react';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">🔍 Halaman Tidak Ditemukan</h1>
        <p className="mt-4 text-lg text-gray-600">Sepertinya alamat yang Anda kunjungi tidak ada. Silakan cek kembali URL atau kembali ke beranda.</p>
        <a href="/" className="mt-6 inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Kembali ke Beranda
        </a>
      </div>
    </section>
  );
}
