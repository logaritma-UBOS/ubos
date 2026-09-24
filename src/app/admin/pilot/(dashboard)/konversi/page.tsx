import PushNotifClient from "@/components/PushNotifClient"
import ClearHistoryClient from "@/components/ClearHistoryClient"
import FonnteWaButton from "@/components/FonnteWaButton";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pushFollowUpNotification, clearFreeBroadcasts } from "@/actions/admin";
import { formatNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";


// Server Actions diekstrak keluar dari komponen untuk mencegah error serialisasi closure




export default async function KonversiPage() {
  try {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Data Aktual Bulan Ini (Bulan Berjalan)
  const monthlyVisits = await prisma.visitorAnalytics.count({
    where: { createdAt: { gte: firstDay } }
  });

  const monthlySignups = await prisma.user.count({
    where: { createdAt: { gte: firstDay } }
  });

  const rawMonthlyRevenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID", createdAt: { gte: firstDay } },
    select: { userId: true }
  });
  const monthlyPremium = new Set(rawMonthlyRevenues.map(r => r.userId)).size;

  // Data Aktual Hari Ini (Real-time Funnel)
  const todayVisits = await prisma.visitorAnalytics.count({
    where: { createdAt: { gte: startOfToday } }
  });

  const todaySignups = await prisma.user.count({
    where: { createdAt: { gte: startOfToday } }
  });

  const rawTodayRevenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID", createdAt: { gte: startOfToday } },
    select: { userId: true }
  });
  const todayPremium = new Set(rawTodayRevenues.map(r => r.userId)).size;

  // Conversion Rates (Hari Ini)
  const rateTrafikToFree = todayVisits > 0 ? ((todaySignups / todayVisits) * 100).toFixed(1) : "0.0";
  const rateFreeToPremium = todaySignups > 0 ? ((todayPremium / todaySignups) * 100).toFixed(1) : "0.0";

  // Target Backward Mapping Konversi (Metode Logaritma)
  const targetSetting = await prisma.systemSetting.findUnique({ where: { key: "MONTHLY_REVENUE_TARGET" } });
  const targetRevenue = targetSetting ? parseInt(targetSetting.value, 10) : 10000000;
  
  // Asumsi langganan per user = Rp 99.000
  const avgSubscriptionPrice = 99000;
  
  // 1. Goal Utama: Berapa Premium User yang dibutuhkan?
  const targetPremium = Math.ceil(targetRevenue / avgSubscriptionPrice);
  
  // 2. Backward Map ke Signups: Asumsi konversi Free -> Premium = 10%
  const targetSignups = targetPremium * 10;
  
  // 3. Backward Map ke Trafik: Asumsi konversi Visit -> Free = 5%
  const targetVisits = targetSignups * 20; 

  const gapPremium = targetPremium - monthlyPremium;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed + 1;

  const dailyPremiumNeeded = gapPremium > 0 ? Math.ceil(gapPremium / daysLeft) : 0;

  // Data Follow Up H+3
  // Ambil semua revenue untuk membedakan premium vs free
  const allRevenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID" },
    select: { userId: true }
  });
  const allPremiumUserIds = new Set(allRevenues.map(r => r.userId));
  const internalEmails = ["logaritma.tim@gmail.com", "tony@logaritma.id", "reza@logaritma.id", "bana@logaritma.id"];

  // Ambil SEMUA pendaftar Tenant (role OWNER) dan data aktivitasnya
  const allOwners = await prisma.user.findMany({
    where: { 
      role: "OWNER",
      email: { notIn: internalEmails }
    },
    include: {
      businesses: {
        include: {
          _count: {
            select: { products: true, sales: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter khusus Free Member
  const targetWaUsers = allOwners.filter(u => !allPremiumUserIds.has(u.id));

  // Helper function untuk menentukan status aktivitas (Gap Analysis)
  const getActivityStatus = (u: any) => {
    if (!u.businesses || u.businesses.length === 0) return { label: "Baru Daftar (Pasif)", color: "bg-slate-100 text-slate-600 border-slate-200" };
    
    let totalSales = 0;
    let totalProducts = 0;
    
    u.businesses.forEach((b: any) => {
      if (b._count) {
        totalSales += b._count.sales || 0;
        totalProducts += b._count.products || 0;
      }
    });

    if (totalSales > 0) return { label: "Aktif Berjualan", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (totalProducts > 0) return { label: "Sedang Setup Katalog", color: "bg-blue-100 text-blue-700 border-blue-200" };
    return { label: "Toko Dibuat (Belum Ada Produk)", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  };

  // Server Action untuk push notifikasi
  

    

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto space-y-8">
        <Link href="/admin/pilot" className="text-emerald-600 text-sm font-bold inline-block hover:underline">&larr; Kembali ke Dashboard</Link>
        
        <div>
          <h1 className="text-3xl font-black text-slate-900">Metrik Konversi & Funneling</h1>
          <p className="text-slate-500 mt-2">Analisis efektivitas akuisisi (Trafik ➔ Free) dan pencapaian goal utama (Free ➔ Premium).</p>
        </div>

        {/* 1. Pemetaan - Kebutuhan (3 Tahap Funnel) */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">1. Analisis Funnel (Kondisi Hari Ini vs Target)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TAHAP 1: TRAFIK */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Trafik Kunjungan</h3>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-4xl font-black text-slate-700">{formatNumber(todayVisits)}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Pengunjung Hari Ini</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-400">{formatNumber(monthlyVisits)}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Bulan Ini</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: `${Math.min((monthlyVisits / targetVisits) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* TAHAP 2: FREE TENANT */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1 hidden md:block z-10 shadow-sm">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 font-black text-xs px-2.5 py-1 rounded-full border border-emerald-200">
                Rate: {rateTrafikToFree}%
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Pendaftar (Free)</h3>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-4xl font-black text-emerald-600">{formatNumber(todaySignups)}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Terkonversi Hari Ini</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-400">{formatNumber(monthlySignups)}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Bulan Ini</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min((monthlySignups / targetSignups) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* TAHAP 3: PREMIUM */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-blue-100 relative shadow-sm">
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1 hidden md:block z-10 shadow-sm">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 font-black text-xs px-2.5 py-1 rounded-full border border-blue-200">
                Rate: {rateFreeToPremium}%
              </div>
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">3. Goal: Premium</h3>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-4xl font-black text-blue-600">{formatNumber(todayPremium)}</p>
                  <p className="text-xs text-slate-500 font-bold mt-1">Donatur Hari Ini</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-400">{formatNumber(monthlyPremium)}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Bulan Ini</p>
                </div>
              </div>
              <div className="mt-4 w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min((monthlyPremium / targetPremium) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
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
                <h4 className="text-red-800 font-bold mb-1">Gap Konversi Premium: -{formatNumber(gapPremium > 0 ? gapPremium : 0)} User</h4>
                <p className="text-sm text-red-600 font-medium">Strategi: Gunakan alat pendukung di bawah untuk mem-follow up {formatNumber(todaySignups)} pendaftar Free hari ini agar terkonversi menjadi Premium.</p>
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
                  <span className="text-[10px] text-slate-400 font-bold">PREMIUM</span>
                  <span className="text-sm font-black text-slate-800">+{formatNumber(dailyPremiumNeeded)}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Target Goal Harian</h4>
                  <p className="text-sm text-slate-600 mt-1">Dibutuhkan konversi donatur baru setiap hari hingga akhir bulan untuk mencapai goal utama.</p>
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
                <p className="text-slate-400 text-sm mt-1">Sistem & tools pendobrak konversi dari Free menuju Premium.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tool 1 */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative">
              <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md">TELAH AKTIF</div>
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white">1. Popup Donasi</h4>
                <p className="text-xs text-slate-400 mt-1">Aktif tiap 3 menit di Dasbor</p>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center gap-4 relative">
              <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md">TELAH AKTIF</div>
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-white">2. Social Proof</h4>
                <p className="text-xs text-slate-400 mt-1">Daftar donatur aktif di Dasbor</p>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between relative h-full">
              <div>
                <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <h4 className="font-bold text-white">3. Notifikasi Dasbor</h4>
                <p className="text-xs text-slate-400 mt-1 mb-6">Tembakkan pesan ke bel notifikasi khusus untuk segmen Free.</p>
              </div>
              <PushNotifClient action={pushFollowUpNotification} />
            </div>

            {/* Tool 4 */}
            <Link href="#tabel-prospek" className="text-left bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors flex items-center gap-4 group cursor-pointer block relative">
              <div className="absolute top-2 right-2 bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md">LIHAT TABEL BAWAH</div>
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white">4. WA Follow Up (Semua Tenant)</h4>
                <p className="text-xs text-slate-400 mt-1">Blast terotomatisasi API Fonnte ke Prospek Free</p>
              </div>
                        </Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-white text-sm font-bold">Riwayat Broadcast (Tenant Free)</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-xl">Menghapus riwayat akan membersihkan data sekaligus menarik kembali (*recall*) semua Notifikasi yang belum dibaca dari Dasbor Tenant Free.</p>
            </div>
            <ClearHistoryClient action={clearFreeBroadcasts} />
          </div>
        </section>

        {/* Tabel Prospek H+3 */}
        <div id="tabel-prospek" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Daftar Prospek WA Blast (Semua Tenant Free)</h3>
              <p className="text-sm text-slate-500 mt-1">Segmentasi GAP pengguna Free berdasarkan aktivitas terakhir mereka (Terintegrasi Fonnte API).</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">{targetWaUsers.length} Target User</span>
          </div>
          
          {targetWaUsers.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 font-medium text-sm">Saat ini tidak ada pendaftar Free.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Nama / Email</th>
                    <th className="px-4 py-3 font-semibold">Tgl Daftar</th>
                    <th className="px-4 py-3 font-semibold">Aktivitas Terakhir (GAP)</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {targetWaUsers.map((u, i) => {
                    const status = getActivityStatus(u);
                    return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800">{u.name || "Tanpa Nama"}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {new Date(u.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <FonnteWaButton phone={u.phone} name={u.name} statusLabel={status.label} />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
  } catch (error: any) {
    console.error("KONVERSI CRASH:", error);
    return (
      <div className="p-10 bg-white">
        <h1 className="text-red-500 font-bold text-2xl">SERVER ERROR</h1>
        <pre className="mt-4 p-4 bg-slate-100 rounded-xl overflow-auto text-xs">{error?.message || String(error)}</pre>
        <pre className="mt-4 p-4 bg-slate-100 rounded-xl overflow-auto text-xs">{error?.stack}</pre>
      </div>
    );
  }
}
