import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber, formatRupiah } from "@/lib/format"
import { getRevenueSnapshot } from "@/lib/ownerEngine"

export const dynamic = "force-dynamic"

export default async function MerchantIntelligencePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    return <div className="p-8">Unauthorized. Silakan login dari Control Center.</div>
  }

  const revenueSnapshot = await getRevenueSnapshot()
  const revenueSetting = await prisma.systemSetting.findUnique({ where: { key: "owner_revenue_target_weekly" } })
  const rawTarget = revenueSetting ? parseFloat(revenueSetting.value) : NaN
  const revenueTarget: number | null = (!isNaN(rawTarget) && rawTarget > 0) ? rawTarget : null

  const revenueTrend = revenueSnapshot.previousPeriodRevenue > 0
    ? ((revenueSnapshot.currentPeriodRevenue - revenueSnapshot.previousPeriodRevenue) / revenueSnapshot.previousPeriodRevenue) * 100
    : null

  const revenueGapBefore = revenueTarget !== null
    ? revenueTarget - revenueSnapshot.currentPeriodRevenue
    : null

  return (
    <AdminLayout activeMenu="merchant-intelligence">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Merchant Sales Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Volume penjualan seluruh merchant (Global Aggregation)</p>
        </div>

        <div className={"p-5 rounded-2xl shadow-sm border "}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Revenue (7 Hari)</p>
          {revenueSnapshot.totalTransactions === 0 ? (
            <>
              <p className="text-base font-black text-slate-400 leading-none">Rp 0</p>
              <p className="text-[10px] text-slate-400 mt-1">Belum ada transaksi POS tersimpan.</p>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-slate-900 leading-none">{formatRupiah(revenueSnapshot.currentPeriodRevenue)}</p>
              <div className="flex items-center gap-2 mt-1">
                {revenueTrend !== null ? (
                  <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded "}>
                    {revenueTrend >= 0 ? '▲' : '▼'} {Math.abs(revenueTrend).toFixed(1)}% vs 7H lalu
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">— vs 7H lalu</span>
                )}
              </div>
              {revenueTarget !== null && revenueGapBefore !== null && (
                <p className={"text-[10px] font-bold mt-1 "}>
                  Target: {formatRupiah(revenueTarget)} • Gap: {revenueGapBefore <= 0 ? '+' : ''}{formatRupiah(revenueGapBefore)}
                </p>
              )}
              <p className="text-[9px] text-slate-400 mt-1">{formatNumber(revenueSnapshot.currentPeriodTransactions)} transaksi • Ø {formatRupiah(revenueSnapshot.avgTransactionValue)}</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">7 Hari Terakhir</p>
            <p className="text-lg font-black text-slate-900">{formatRupiah(revenueSnapshot.currentPeriodRevenue)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{revenueSnapshot.currentPeriodTransactions} transaksi</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">7 Hari Sebelumnya</p>
            <p className="text-lg font-black text-slate-900">{formatRupiah(revenueSnapshot.previousPeriodRevenue)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{revenueSnapshot.previousPeriodTransactions} transaksi</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">All Time Revenue</p>
            <p className="text-lg font-black text-slate-900">{formatRupiah(revenueSnapshot.allTimeRevenue)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{revenueSnapshot.totalTransactions} transaksi total</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Avg Transaksi</p>
            <p className="text-lg font-black text-slate-900">{revenueSnapshot.totalTransactions > 0 ? formatRupiah(revenueSnapshot.avgTransactionValue) : '—'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Per transaksi (all time)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
