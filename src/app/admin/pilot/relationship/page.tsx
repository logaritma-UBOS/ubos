import Link from "next/link";
export default function RelationshipPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold mb-6 inline-block">&larr; Kembali ke Dashboard</Link>
        <h1 className="text-3xl font-black text-purple-700 mb-4">Relationship & Rawat VIP</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">Di halaman ini kelak kita akan mengelola:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
            <li>Daftar User VIP (Premium) yang telah berdonasi</li>
            <li>Membaca dan membalas masukan (Feedback) dari formulir Dasbor UMKM</li>
            <li>Menawarkan layanan Upsell (Integrasi WhatsApp / Layanan Eksklusif)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}