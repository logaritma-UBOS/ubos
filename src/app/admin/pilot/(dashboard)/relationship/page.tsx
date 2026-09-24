import ClearHistoryClient from "@/components/ClearHistoryClient"
import PushBannerClient from "@/components/PushBannerClient"
import PushNotifClient from "@/components/PushNotifClient"
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { pushDashboardInfo, pushPushNotification, clearAllBroadcasts } from "@/actions/admin";
import { formatNumber, formatRupiah } from "@/lib/format";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";


// Server Actions diekstrak keluar dari komponen untuk mencegah error serialisasi closure





export default async function RelationshipPage() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  // CLEANUP: Hapus semua data dummy 'trx_direct_' yang terlanjur tercatat dari thank-you page
  await prisma.ubosRevenue.deleteMany({
    where: { mayarTrxId: { startsWith: "trx_direct_" } }
  });

  // Ambil Data Revenue & Relasi Premium
  const allPremiumRevenues = await prisma.ubosRevenue.findMany({
    where: { status: "PAID" },
    orderBy: { createdAt: 'desc' }
  });

  const uniqueUserIds = Array.from(new Set(allPremiumRevenues.map(r => r.userId)));
  const usersData = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } }
  });
  const userMapDb = new Map(usersData.map(u => [u.id, u]));

  const userMap = new Map();
  let totalRevenueMonth = 0;
  let totalRevenueAllTime = 0;

  for (const rev of allPremiumRevenues) {
    totalRevenueAllTime += rev.amount;
    if (rev.createdAt >= firstDay) {
      totalRevenueMonth += rev.amount;
    }

    if (!userMap.has(rev.userId)) {
      userMap.set(rev.userId, {
        user: userMapDb.get(rev.userId) || null,
        totalDonated: rev.amount,
        lastDonation: rev.createdAt
      });
    } else {
      const existing = userMap.get(rev.userId);
      existing.totalDonated += rev.amount;
      userMap.set(rev.userId, existing);
    }
  }

  const premiumUsers = Array.from(userMap.values());
  const totalPremiumUsers = premiumUsers.length;

  // Target Backward Mapping Relationship (Maintenance & Upsell)
  const targetPremiumUsers = 50;
  const targetRevenue = 5000000;

  const gapPremium = targetPremiumUsers - totalPremiumUsers;
  const gapRevenue = targetRevenue - totalRevenueMonth;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = daysInMonth - daysPassed + 1;

  const dailyRevenueNeeded = gapRevenue > 0 ? Math.ceil(gapRevenue / daysLeft) : 0;

  

    

    

    

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto space-y-8" suppressHydrationWarning>
        <Link href="/admin/pilot" className="text-blue-600 text-sm font-bold inline-block hover:underline">&larr; Kembali ke Dashboard</Link>
        
        <div>
          <h1 className="text-3xl font-black text-slate-900">Metrik Relationship (Premium)</h1>
          <p className="text-slate-500 mt-2">Analisis Retensi dan *Upsell* khusus untuk kolam pengguna VIP (Donatur).</p>
        </div>

        {/* 1. Pemetaan - Kebutuhan */}
        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">1. Retensi VIP vs Target Pendapatan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pengguna Premium</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-5xl font-black text-blue-600">{formatNumber(totalPremiumUsers)}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1">Donatur Aktif</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-400">{formatNumber(targetPremiumUsers)}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Kebutuhan Target VIP</p>
                </div>
              </div>
              <div className="mt-5 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((totalPremiumUsers / targetPremiumUsers) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Pendapatan (Bulan Ini)</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-4xl font-black text-emerald-600">{formatRupiah(totalRevenueMonth)}</p>
                  <p className="text-sm text-slate-500 font-bold mt-1">Total Sepanjang Masa: {formatRupiah(totalRevenueAllTime)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-400">{formatRupiah(targetRevenue)}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Target Pendapatan</p>
                </div>
              </div>
              <div className="mt-5 w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((totalRevenueMonth / targetRevenue) * 100, 100)}%` }}></div>
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
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="text-orange-800 font-bold mb-1">Gap Pendapatan: -{formatRupiah(gapRevenue > 0 ? gapRevenue : 0)}</h4>
                <p className="text-sm text-orange-600 font-medium">Strategi: Lakukan Maintenance pada {totalPremiumUsers} pengguna VIP saat ini, tawarkan fitur upsell/layanan tambahan eksklusif melalui WA Blast & Notifikasi Dasbor.</p>
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
                  <span className="text-[10px] text-slate-400 font-bold">REVENUE</span>
                  <span className="text-sm font-black text-slate-800">+{formatRupiah(dailyRevenueNeeded).replace('Rp', '')}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Target Upsell Harian</h4>
                  <p className="text-sm text-slate-600 mt-1">Dibutuhkan tambahan donasi atau upsell setiap harinya untuk menutup Gap Pendapatan bulan ini.</p>
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
                <h2 className="text-xl font-bold">Alat Eksekusi Maintenance & Upsell</h2>
                <p className="text-slate-400 text-sm mt-1">Sentuh pengguna VIP Anda secara eksklusif menggunakan fitur di bawah.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tool 1: Info Dasbor */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between relative h-full">
              <div>
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="font-bold text-white">Info Dasbor (Banner)</h4>
                <p className="text-xs text-slate-400 mt-1 mb-6">Munculkan banner informasi/upsell secara eksklusif di Dasbor Tenant Premium.</p>
              </div>
              <PushBannerClient action={pushDashboardInfo} />
            </div>

            {/* Tool 2: Notifikasi */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between relative h-full">
              <div>
                <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <h4 className="font-bold text-white">Notifikasi In-App</h4>
                <p className="text-xs text-slate-400 mt-1 mb-6">Tembakkan pesan ke bel notifikasi khusus untuk segmen Premium.</p>
              </div>
              <PushNotifClient action={pushPushNotification} />
            </div>

            {/* Tool 3: WA Blast */}
            <Link href="#tabel-vip" className="text-left bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-colors flex flex-col justify-between group cursor-pointer h-full">
              <div>
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </div>
                <h4 className="font-bold text-white">WA Blast (VIP)</h4>
                <p className="text-xs text-slate-400 mt-1">Buka daftar nomor WhatsApp Donatur (Tabel Bawah).</p>
              </div>
              <div className="w-full text-center py-2.5 rounded-lg border border-white/20 text-xs font-bold text-slate-300 mt-6">
                LIHAT DATABASE
                </div>
              </Link>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-white text-sm font-bold">Riwayat Broadcast & Banner Aktif</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-xl">Menghapus riwayat akan membersihkan data sekaligus menarik kembali (*recall*) semua Banner dan Notifikasi yang belum dibaca dari Dasbor Tenant VIP.</p>
              </div>
              <ClearHistoryClient action={clearAllBroadcasts} />
            </div>
          </section>

        {/* Tabel Maintenance VIP */}
        <div id="tabel-vip" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Database & Maintenance VIP (Premium Users)</h3>
              <p className="text-sm text-slate-500 mt-1">Daftar donatur aktif yang siap diberikan *extra service* atau *upsell* khusus via WhatsApp.</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100">{premiumUsers.length} VIP User</span>
          </div>
          
          {premiumUsers.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <p className="text-slate-500 font-medium text-sm">Belum ada pengguna VIP terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Nama / Email</th>
                    <th className="px-4 py-3 font-semibold">Total Donasi</th>
                    <th className="px-4 py-3 font-semibold">Tgl Donasi Terakhir</th>
                    <th className="px-4 py-3 font-semibold rounded-tr-lg">Aksi Upsell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {premiumUsers.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {p.user?.name || "Tanpa Nama"}
                          <span className="bg-blue-100 text-blue-600 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">VIP</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-black text-emerald-600">
                        {formatRupiah(p.totalDonated)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {new Date(p.lastDonation).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`https://wa.me/${p.user?.phone?.replace(/^0/, '62') || ''}?text=${encodeURIComponent("Halo Kak " + (p.user?.name || "") + ", terima kasih banyak sudah menjadi Donatur VIP UBOS! Kami punya penawaran fitur ekstra eksklusif nih khusus untuk Kakak...")}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          Chat WA VIP
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
