import Link from "next/link";
export default function KonversiPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-emerald-700 mb-4">Konversi Premium</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">Di halaman ini kelak kita akan mengelola:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
            <li>Daftar User Gratis (Free) yang paling aktif</li>
            <li>Peluncuran pop-up promo / Nag Screen agresif</li>
            <li>Metrik keberhasilan donasi Mayar harian</li>
          </ul>
        </div>
      </div>
    </div>
  );
}