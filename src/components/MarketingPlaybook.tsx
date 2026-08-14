import React from 'react';
import { Target, CheckCircle2, Zap, ArrowRight, XCircle, LayoutDashboard, MessageCircle, BarChart3, Clock } from 'lucide-react';

export default function MarketingPlaybook() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Target Market & USP */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Target className="text-primary" /> Target Market & USP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-1">
            <h4 className="font-bold text-amber-400 mb-2">Target Market Utama</h4>
            <p className="text-white font-black text-lg mb-2">"The Overwhelmed Solopreneur"</p>
            <p className="text-sm text-slate-400 mb-4">(Owner F&B, Laundry, Percetakan, Ritel skala Mikro/Kecil)</p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h5 className="font-bold text-red-400 text-sm mb-2 flex items-center gap-2"><XCircle size={14}/> Core Pain Points:</h5>
              <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
                <li>Profit bocor (uang masuk & keluar campur)</li>
                <li>Operasional serba dikerjakan sendiri</li>
                <li>Pusing melacak HPP vs Harga Jual</li>
                <li>Gaptek, takut pakai sistem yang rumit</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2">
            <h4 className="font-bold text-emerald-400 mb-4">4 USP Highlights (Ultimate Selling Proposition)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/20 p-2 rounded-lg"><BarChart3 size={16} className="text-primary"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">1. Backward Mapping</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Kunci profit bersih harian. Ubah mindset "jualan dulu baru hitung untung" menjadi "tentukan target profit dulu, sistem yang hitung target jualan harian".</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg"><LayoutDashboard size={16} className="text-emerald-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">2. Instan Omnichannel</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Satu dashboard untuk POS Kasir Kasar & Toko Online bergaya e-commerce (Olshopin-style). Siap jualan online dalam 3 menit.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-500/20 p-2 rounded-lg"><Zap size={16} className="text-amber-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">3. AI Copilot Industri</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Asisten AI (Logaritma Engine) yang disesuaikan per kategori (F&B, Jasa, Ritel). Memberi saran HPP, promo, & efisiensi secara otomatis.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg"><Target size={16} className="text-purple-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">4. 40% Affiliate Engine</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Lifetime locking cookies. Sistem viral marketing otomatis dimana pengguna bisa jadi afiliator dengan komisi recurring terbesar di kelasnya.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kompetitor Comparison */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <LayoutDashboard className="text-primary" /> Perbandingan vs Kompetitor
        </h3>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-bold border-b border-slate-700">Fitur / Benefit</th>
                  <th className="p-4 font-bold border-b border-slate-700 text-slate-400">POS Biasa (M**a, P***n)</th>
                  <th className="p-4 font-bold border-b border-slate-700 text-slate-400">Software Akuntansi (J****l)</th>
                  <th className="p-4 font-black border-b border-emerald-500 bg-emerald-500/10 text-emerald-400">Logaritma UBOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Toko Online Terintegrasi</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Bayar Add-on Mahal</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Gratis (Bawaan Sistem)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Fokus Keuangan</td>
                  <td className="p-4"><span className="text-amber-400">Hanya Catat Omzet</span></td>
                  <td className="p-4"><CheckCircle2 size={16} className="text-emerald-400 inline mr-2"/> Sangat Lengkap (Rumit)</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Target Profit (Backward Mapping)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Asisten AI Strategis</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Logaritma Engine Khusus UMKM</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Learning Curve (Kemudahan)</td>
                  <td className="p-4"><span className="text-emerald-400">Mudah (Gampang dipelajari)</span></td>
                  <td className="p-4"><span className="text-red-400">Sangat Sulit (Butuh Akuntan)</span></td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Sangat Mudah (Sistem Kasar & Cepat)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Program Afiliasi Recurring</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Kecil / Sekali Bayar</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Terbatas</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> 40% Lifetime Passive Income</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Roadmap Eksekusi */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Clock className="text-primary" /> Roadmap Eksekusi Pemasaran (3 Minggu Pertama)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl font-black text-blue-500">1</span>
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full mb-4">Minggu 1</span>
              <h4 className="text-lg font-black text-white mb-2">Founder-Led Content</h4>
              <p className="text-sm text-slate-400 mb-4 h-16">Edukasi masif tentang bahayanya "Profit Bocor" dan pentingnya memisahkan uang pribadi vs bisnis.</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Buat 5 video short/reels tentang studi kasus UMKM bangkrut karena HPP salah.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Gunakan Fonnte WA untuk menyapa cold leads.</p>
                </div>
                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-800">
                  <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-400">Target: 50 Leads (Free Trial)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl font-black text-purple-500">2</span>
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full mb-4">Minggu 2</span>
              <h4 className="text-lg font-black text-white mb-2">Afiliator Pionir</h4>
              <p className="text-sm text-slate-400 mb-4 h-16">Merekrut user awal yang puas untuk menjadi promotor pasif (menggunakan link afiliasi 40%).</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Siapkan Marketing Kit (Swipe file, banner) di Dashboard Affiliate.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Webinar Zoom "Cara Dapat 5 Juta/Bulan Hanya Sebar Link UBOS".</p>
                </div>
                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-800">
                  <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-400">Target: 10-20 Afiliator Aktif</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl font-black text-emerald-500">3</span>
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-4">Minggu 3</span>
              <h4 className="text-lg font-black text-white mb-2">Gerilya Komunitas</h4>
              <p className="text-sm text-slate-400 mb-4 h-16">Infiltrasi grup WhatsApp, Facebook UMKM, dan komunitas pengusaha daerah.</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Bagikan template Excel "Kalkulator HPP" gratis bersyarat (daftar UBOS).</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300">Gunakan WA Blast (Fonnte) ke database komunitas lokal.</p>
                </div>
                <div className="flex items-start gap-2 mt-4 pt-4 border-t border-slate-800">
                  <Target size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-400">Target: 200 Leads & 15 Konversi Paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
