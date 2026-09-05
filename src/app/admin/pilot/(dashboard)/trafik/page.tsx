import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TrafikPage() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Data Aktual (Bulan ini untuk backward mapping)
  const monthlyVisits = await prisma.visitorAnalytics.count({
    where: { createdAt: { gte: firstDay } }
  });

  const monthlySignups = await prisma.user.count({
    where: { createdAt: { gte: firstDay } }
  });

  // Data Aktual (HARI INI - Realtime Live)
  const todayVisits = await prisma.visitorAnalytics.count({
    where: { createdAt: { gte: startOfToday } }
  });

  const todaySignups = await prisma.user.count({
    where: { createdAt: { gte: startOfToday } }
  });

  // Referrer HARI INI
  const rawReferrersToday = await prisma.visitorAnalytics.groupBy({
    by: ['referrer'],
    where: { createdAt: { gte: startOfToday }, referrer: { not: null } },
    _count: { referrer: true },
  });

  // Kategori Sumber Trafik
  const sourceCount: Record<string, number> = {
    'Direct / Langsung': 0,
    'WhatsApp': 0,
    'Instagram': 0,
    'TikTok': 0,
    'YouTube': 0,
    'Website Lainnya': 0
  };

  for (const r of rawReferrersToday) {
    const ref = (r.referrer || "").toLowerCase();
    const count = r._count.referrer;
    
    if (!ref || ref === "") {
      sourceCount['Direct / Langsung'] += count;
    } else if (ref.includes('wa.me') || ref.includes('whatsapp') || ref.includes('api.whatsapp')) {
      sourceCount['WhatsApp'] += count;
    } else if (ref.includes('instagram.com') || ref.includes('ig.me') || ref.includes('l.instagram')) {
      sourceCount['Instagram'] += count;
    } else if (ref.includes('tiktok.com')) {
      sourceCount['TikTok'] += count;
    } else if (ref.includes('youtube.com') || ref.includes('youtu.be')) {
      sourceCount['YouTube'] += count;
    } else {
      sourceCount['Website Lainnya'] += count;
    }
  }

  const sortedSources = Object.entries(sourceCount)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  // Backward Mapping Targets (Sistem Logaritma)
  const targetVisits = 10000;
  const targetSignups = 500;
  
  const gapVisits = targetVisits - monthlyVisits;
  const gapSignups = targetSignups - monthlySignups;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed + 1; // Termasuk hari ini

  const dailyVisitsNeeded = gapVisits > 0 ? Math.ceil(gapVisits / daysLeft) : 0;
  const dailySignupsNeeded = gapSignups > 0 ? Math.ceil(gapSignups / daysLeft) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold inline-block hover:underline">&larr; Kembali ke Dashboard</Link>
        
        <div>
          <h1 className="text-3xl font-black text-slate-900">Metrik Trafik & Backward Mapping</h1>
          <p className="text-slate-500 mt-2">Analisis data akuisisi *real-time* hari ini dan strategi pencapaian target bulanan Logaritma.</p>
        </div>

        {/* 1. Pemetaan - Kebutuhan */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">1. Pemetaan Kondisi vs Kebutuhan (Target)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Trafik Kunjungan (Real-time)</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-5xl font-black text-blue-600">{formatNumber(todayVisits)}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1">Masuk Hari Ini</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-400">{formatNumber(monthlyVisits)} / {formatNumber(targetVisits)}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Total Bulan Ini vs Target</p>
                </div>
              </div>
              <div className="mt-5 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((monthlyVisits / targetVisits) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Pendaftar Baru (Real-time)</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-5xl font-black text-emerald-600">{formatNumber(todaySignups)}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1">Daftar Hari Ini</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-400">{formatNumber(monthlySignups)} / {formatNumber(targetSignups)}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Total Bulan Ini vs Target</p>
                </div>
              </div>
              <div className="mt-5 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((monthlySignups / targetSignups) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Sumber Trafik Hari Ini */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Sumber Kedatangan Hari Ini</h3>
          <p className="text-sm text-slate-500 mb-6">Analisis asal platform trafik yang mengunjungi ubos.logaritma.id hari ini.</p>
          
          {sortedSources.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 font-medium">Belum ada kunjungan yang terekam hari ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedSources.map(([source, count], idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      source === 'WhatsApp' ? 'bg-green-100 text-green-600' :
                      source === 'Instagram' ? 'bg-pink-100 text-pink-600' :
                      source === 'TikTok' ? 'bg-black text-white' :
                      source === 'YouTube' ? 'bg-red-100 text-red-600' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      <span className="text-xs font-black">{source.substring(0, 1)}</span>
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{source}</span>
                  </div>
                  <span className="font-black text-lg text-slate-800">{formatNumber(count)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Analisis Gap & 3. Langkah Harian */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-red-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <svg className="w-32 h-32 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <span className="font-bold">2</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Analisis Gap & Action Plan</h2>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="text-red-800 font-bold mb-1">Gap Trafik: -{formatNumber(gapVisits > 0 ? gapVisits : 0)} Kunjungan</h4>
                <p className="text-sm text-red-600 font-medium">Strategi: Perbanyak kampanye edukasi di kanal gratis (grup UMKM) & optimasi SEO kata kunci "aplikasi kasir gratis".</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="text-orange-800 font-bold mb-1">Gap Pendaftar: -{formatNumber(gapSignups > 0 ? gapSignups : 0)} User</h4>
                <p className="text-sm text-orange-600 font-medium">Strategi: Jadikan landing page lebih *to the point*, berikan CTA jelas, dan tawarkan Setup Gratis.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <span className="font-bold">3</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Langkah Harian Terukur</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold">VISIT</span>
                  <span className="text-sm font-black text-slate-800">+{formatNumber(dailyVisitsNeeded)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Target Kunjungan Harian</h4>
                  <p className="text-sm text-slate-600 mt-1">Dibutuhkan kunjungan baru setiap hari hingga akhir bulan untuk menutup Gap Trafik.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold">USER</span>
                  <span className="text-sm font-black text-slate-800">+{formatNumber(dailySignupsNeeded)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Target Pendaftar Harian</h4>
                  <p className="text-sm text-slate-600 mt-1">Dibutuhkan registrasi akun baru setiap hari hingga akhir bulan untuk mencapai Kebutuhan.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 4. Alat Pendukung Eksekusi */}
        <section className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
                <span className="font-bold">4</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Alat Pendukung Eksekusi</h2>
                <p className="text-slate-400 text-sm mt-1">Sistem & tools pendobrak trafik harian Anda.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/pilot/marketing" className="text-left bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors flex items-center gap-4 group cursor-pointer block">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white">WhatsApp Blast</h4>
                <p className="text-xs text-slate-400 mt-1">Eksekusi penyebaran pesan promo</p>
              </div>
            </Link>
            <Link href="/admin/pilot/konten" className="text-left bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors flex items-center gap-4 group cursor-pointer block">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white">Konten Kalender</h4>
                <p className="text-xs text-slate-400 mt-1">Jadwal publikasi edukasi & promo</p>
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
