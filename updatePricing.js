const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const oldPricingSection = `<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col relative">
              <h3 className="text-2xl font-bold mb-2">Paket Starter</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black">Gratis</span>
                <span className="text-slate-400">/ Rp0</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300">Kasir POS dasar</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300">Maksimal 15 katalog menu</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300">Kontrol stok dasar</span>
                </li>
              </ul>
              <Link href="/founder" className="w-full py-4 rounded-xl font-bold text-center bg-slate-700 text-white hover:bg-slate-600 transition-colors">
                Coba Gratis Sekarang
              </Link>
            </div>
            
            {/* Founder Pass */}
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-900 rounded-3xl p-8 border border-emerald-500 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/50 mt-8 md:mt-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 font-black px-4 py-1.5 rounded-full text-sm shadow-lg whitespace-nowrap">
                🔥 Khusus 100 Pemilik Usaha Pertama
              </div>
              <h3 className="text-2xl font-bold mb-2">Paket Founder Pass</h3>
              <p className="text-emerald-200 text-sm mb-4 font-medium uppercase tracking-wide">Terlaris</p>
              <div className="flex flex-col mb-6">
                <span className="text-xl text-emerald-300/70 line-through font-medium">Rp1.500.000</span>
                <span className="text-4xl font-black">Rp399.000</span>
                <span className="text-emerald-200 text-sm mt-1">Sekali bayar seumur hidup, tanpa biaya langganan lagi</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white">Akses Semua Modul Tanpa Batas (Unlimited Menu & Transaksi)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white">Modul Marketing Engine & Template Konten Traffic</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white">Integrasi WhatsApp Struk & Database Pelanggan Tanpa Batas</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white">Rekomendasi AI Harian (Tutup Gap Omzet Otomatis)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white">Free Update Fitur Baru UBOS</span>
                </li>
              </ul>
              <Link href="/founder" className="w-full py-4 rounded-xl font-bold text-center bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-lg">
                Kunci Akses Founder Sekarang
              </Link>
            </div>
          </div>`;

const newPricingSection = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col relative mt-4">
              <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
              <p className="text-slate-400 text-sm mb-4">Sangat cukup untuk warung pemula.</p>
              <div className="flex flex-col mb-6">
                <span className="text-4xl font-black text-white">Gratis</span>
                <span className="text-slate-400 text-sm mt-1">Selamanya</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300 text-sm">Kasir POS dasar</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300 text-sm">Maksimal 15 katalog produk</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300 text-sm">Riwayat mutasi 7 hari terakhir</span>
                </li>
              </ul>
              <Link href="/register" className="w-full py-3 rounded-xl font-bold text-center bg-slate-700 text-white hover:bg-slate-600 transition-colors">
                Mulai Gratis
              </Link>
            </div>
            
            {/* Pro */}
            <div className="bg-slate-800 rounded-3xl p-8 border border-blue-500/50 flex flex-col relative transform md:-translate-y-2 mt-4 md:mt-2 shadow-lg shadow-blue-900/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wider">
                Populer
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">PRO</h3>
              <p className="text-blue-200 text-sm mb-4">Untuk UMKM Naik Kelas.</p>
              <div className="flex flex-col mb-6">
                <span className="text-4xl font-black text-white">Rp 49rb<span className="text-xl font-normal text-slate-400">/bln</span></span>
                <span className="text-blue-300 text-sm mt-1 font-medium">atau Rp 349.000 / tahun</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-200 text-sm">Unlimited katalog produk</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-200 text-sm">Modul Stok & Supplier</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-200 text-sm">Database Pelanggan</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-200 text-sm">Modul Pengeluaran</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-200 text-sm">Insight Rekomendasi Harian</span>
                </li>
              </ul>
              <Link href="/founder" className="w-full py-3 rounded-xl font-bold text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Upgrade ke PRO
              </Link>
            </div>

            {/* Founder Pass */}
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-900 rounded-3xl p-8 border border-emerald-400 flex flex-col relative transform md:-translate-y-4 mt-4 md:mt-0 shadow-2xl shadow-emerald-900/50">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 font-black px-4 py-1.5 rounded-full text-xs shadow-lg whitespace-nowrap uppercase tracking-wider">
                🔥 Khusus 100 Orang
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Lifetime Founder Pass</h3>
              <p className="text-emerald-200 text-sm mb-4">Sekali bayar untuk seumur hidup.</p>
              <div className="flex flex-col mb-6">
                <span className="text-xl text-emerald-300/70 line-through font-medium">Rp1.500.000</span>
                <span className="text-4xl font-black text-white">Rp399.000</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white text-sm">Akses SEUMUR HIDUP seluruh modul saat ini dan yang akan datang</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-white text-sm">Termasuk fitur Marketing & Konten</span>
                </li>
              </ul>
              <Link href="/founder" className="w-full py-3 rounded-xl font-bold text-center bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-lg">
                Kunci Akses Founder
              </Link>
            </div>
          </div>`;

code = code.replace(oldPricingSection, newPricingSection);
fs.writeFileSync('src/components/LandingPage.tsx', code);
