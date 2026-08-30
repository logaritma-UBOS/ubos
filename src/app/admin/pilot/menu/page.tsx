import Link from "next/link";
export default function MenuPage() {
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-black text-slate-800 mb-6 px-2 pt-4">Menu Lainnya</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rawat</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <Link href="/admin/pilot/feedback" className="block px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-50">Saran / Masukan</Link>
          <Link href="/admin/pilot/feed" className="block px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-50">Konten Feed Premium</Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tumbuh</h2>
        </div>
        <div className="divide-y divide-gray-100">
          <Link href="/admin/pilot/promo" className="block px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-50">Promo</Link>
          <Link href="/admin/pilot/marketing" className="block px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-50">Marketing</Link>
          <Link href="/admin/pilot/konten" className="block px-4 py-4 text-sm font-semibold text-gray-700 active:bg-gray-50">Konten</Link>
        </div>
      </div>
    </div>
  );
}