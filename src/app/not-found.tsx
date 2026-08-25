export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="text-center px-6">
        <p className="text-6xl font-black text-slate-700 mb-4">404</p>
        <h1 className="text-2xl font-black text-white mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-400 mb-6">Alamat yang Anda kunjungi tidak ada atau telah dipindahkan.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors text-sm"
        >
          Kembali ke Beranda
        </a>
      </div>
    </section>
  );
}
