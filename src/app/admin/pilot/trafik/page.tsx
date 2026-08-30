import Link from "next/link";
export default function TrafikPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-gray-900 mb-4">Trafik & Akuisisi</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">Di halaman ini kelak kita akan mengintegrasikan:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
            <li>Siapa saja yang mengunjungi web UBOS</li>
            <li>Mereka datang dari mana (Referral/Ads/Organic)</li>
            <li>Daftar pendaftar harian (Leads)</li>
            <li>Alat untuk menaikkan angka Trafik (Integrasi Campaign)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}