import Link from "next/link"

export default function FreemiumLock({ featureName }: { featureName: string }) {
  return (
    <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-3xl border border-emerald-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Fitur Terkunci</h2>
      <p className="text-slate-600 mb-6 text-sm leading-relaxed">Modul <span className="font-semibold text-slate-800">{featureName}</span> eksklusif untuk pengguna paket PRO dan Founder Pass. Tingkatkan paket Anda untuk membuka kunci fitur ini dan mengembangkan UMKM Anda.</p>
      <div className="flex flex-col gap-3">
        <Link href="/founder" className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
          Lihat Pilihan Paket (Upgrade)
        </Link>
        <Link href="/beranda" className="text-slate-500 font-medium hover:text-slate-700 text-sm">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
