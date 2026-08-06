const fs = require('fs');

let content = fs.readFileSync('src/app/member/page.tsx', 'utf8');

// Add Edukasi tab to the navigation if not exists
const navOld = `          {([
            { key: 'modul',    icon: Home,      label: 'Modul'    },
            { key: 'affiliate', icon: Star,       label: 'Affiliate' },
            { key: 'services', icon: Wrench,    label: 'Services' },
            { key: 'bantuan',  icon: HelpCircle, label: 'Bantuan' },
          ]`;
const navNew = `          {([
            { key: 'modul',    icon: Home,      label: 'Modul'    },
            { key: 'affiliate', icon: Star,       label: 'Affiliate' },
            { key: 'services', icon: Wrench,    label: 'Services' },
            { key: 'edukasi',  icon: BookOpen,  label: 'Edukasi'  },
            { key: 'bantuan',  icon: HelpCircle, label: 'Bantuan' },
          ]`;
content = content.replace(navOld, navNew);

const modulMlp = `
              {/* Mini Landing Page Modul */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-600">
                  <Target size={14} /> Metode Logaritma
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  Bocor Halus Bikin Bisnis Susah Gede? Jualan Rame Tapi Pas Dihitung Uangnya Habis Gak Bersisa?
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                  Udah saatnya stop tebak-tebakan profit! Ini BUKAN SEKADAR APLIKASI KASIR BIASA. UBOS adalah <strong>Toolset Eksekusi Utama</strong> dari METODE LOGARITMA buat ngerapihin operasional dan ngunci profit bersihmu, otomatis setiap hari! Biarin sistem yang kerja ngitungin HPP, misahin uang modal, dan nyiapin uang untung bersih buat kamu bawa pulang.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Kunci target profit bulanan jadi target harian otomatis.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Cegah uang usaha & pribadi tercampur berantakan.</p>
                  </div>
                </div>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-8 rounded-2xl transition-transform active:scale-95 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2">
                  Mulai Kunci Profitmu Sekarang <ArrowRight size={18} />
                </button>
              </div>
`;

content = content.replace(/(activeTab === 'modul' && \([\s\S]*?)(            <\/div>\n          \)\})/, `$1${modulMlp}$2`);


const affiliateMlp = `
              {/* Mini Landing Page Affiliate */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-purple-600">
                  <TrendingUp size={14} /> Pasif Income
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  Mau Nambah Pemasukan Kenceng Tanpa Harus Jualan Produk Sendiri?
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                  Bantu UMKM lain naik kelas dengan ngenalin mereka ke <strong>Metode Logaritma</strong>. Tinggal sebar link, dan biarkan ekosistem UBOS yang bekerja meyakinkan mereka. Kamu tinggal duduk manis dan dapat pasif income 20% BERKALI-KALI setiap kali mereka pakai atau perpanjang sistem! Gak pake ribet ngurusin pengiriman atau komplain.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Komisi 20% rutin tanpa batas maksimal.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-purple-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Materi promosi lengkap, tinggal copy-paste.</p>
                  </div>
                </div>
                <button onClick={() => setShowFeatureComingSoonModal(true)} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-black py-4 px-8 rounded-2xl transition-transform active:scale-95 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2">
                  Daftar Affiliate Logaritma <ArrowRight size={18} />
                </button>
              </div>
`;

content = content.replace(/(activeTab === 'affiliate' && \([\s\S]*?)(            <\/div>\n          \)\})/, `$1${affiliateMlp}$2`);


const servicesMlp = `
              {/* Mini Landing Page Services */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-600">
                  <Rocket size={14} /> Scale Up Ekosistem
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  Produk Udah Bagus Tapi Sepi Pembeli? Promosi Mentok Gitu-Gitu Aja?
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                  Biar tim profesional Logaritma yang beresin! Services Ekstra ini adalah <strong>Ekosistem Pendukung</strong> buat mempercepat penerapan Metode Logaritma di usahamu. Dari cetak banner biar tokomu makin eye-catching dari jalan raya, foto menu yang bikin ngiler, sampe hajar promosi Meta Ads biar tokomu rame pembeli setiap hari.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-orange-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Dikerjakan tim profesional yang paham behavior UMKM.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-orange-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Fokus mendatangkan traffic dan omzet riil.</p>
                  </div>
                </div>
                <button onClick={() => window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20ingin%20konsultasi%20kebutuhan%20bisnis%20saya%20buat%20scale-up...', '_blank')} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-2xl transition-transform active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
                  Konsultasi Kebutuhan Bisnismu <ArrowRight size={18} />
                </button>
              </div>
`;

content = content.replace(/(activeTab === 'services' && \(\s*<ServicesErrorBoundary>[\s\S]*?)(              <\/div>\n\n            <\/div>\n          <\/ServicesErrorBoundary>\n          \)\})/, `$1${servicesMlp}$2`);


const edukasiTab = `
          {/* Tab: Edukasi */}
          {activeTab === 'edukasi' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logaritma Academy</h2>
                <p className="text-slate-500 text-sm font-medium">Bongkar rahasia profit owner cerdas.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop" alt="E-Book" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                      BEST SELLER
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-2">E-Book: Rahasia Mengunci Profit UMKM</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Pelajari fondasi Metode Logaritma untuk memisahkan uang modal & untung.</p>
                    <div className="mt-auto">
                      <p className="text-slate-400 text-xs line-through font-medium">Rp 99.000</p>
                      <p className="text-primary font-black text-lg mb-4">Rp 49.000</p>
                      <button onClick={() => window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20pesan%20E-Book%20Mengunci%20Profit', '_blank')} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                        Pesan via WhatsApp <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop" alt="Masterclass" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                      FREE VIDEO
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mb-2">Panduan Masterclass POS Kasir</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Kumpulan tutorial cara eksekusi Metode Logaritma pakai UBOS dalam 30 menit.</p>
                    <div className="mt-auto">
                      <p className="text-emerald-500 font-black text-lg mb-4 mt-4">GRATIS</p>
                      <button onClick={() => alert('Video tutorial sedang dalam penyusunan.')} className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                        Tonton Sekarang <MonitorPlay size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Landing Page Edukasi */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mt-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-600">
                  <ShieldCheck size={14} /> Upgrade Mindset
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                  Skill Mentok, Bisnis Otomatis Mentok!
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                  Banyak pengusaha UMKM gagal scale-up bukan karena kurang kerja keras, tapi karena buta finansial usahanya sendiri. Di Logaritma Academy, kami bongkar rahasia owner sukses yang bisa jalan-jalan sementara bisnisnya tetap jalan rapi tanpa bocor operasional. <strong>Penting banget buat paham Mindset dan fondasi Metode Logaritma</strong> sebelum atau sambil kamu eksekusi operasional di UBOS.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Materi teruji langsung dari praktisi lapangan.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-teal-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-700 font-bold">Kuasai ilmunya, lalu jalankan sistemnya pakai UBOS.</p>
                  </div>
                </div>
                <button onClick={() => window.open('https://wa.me/6285179660408?text=Halo%20Admin%20Logaritma%2C%20saya%20mau%20konsultasi%20modul%20edukasi%20Logaritma...', '_blank')} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black py-4 px-8 rounded-2xl transition-transform active:scale-95 shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2">
                  Upgrade Ilmu Sekarang <ArrowRight size={18} />
                </button>
              </div>

            </div>
          )}
`;

content = content.replace(/(          \{\/\* Tab: Affiliate \*\/)/, `${edukasiTab}$1`);

fs.writeFileSync('src/app/member/page.tsx', content, 'utf8');
console.log("Done");
