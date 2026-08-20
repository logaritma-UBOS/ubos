import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  calculateOmzet, calculateTransactionCount, calculateAOV, 
  calculateTotalHPP, calculateExpenses, calculateGrossProfit, 
  calculateNetProfit, calculateMargin 
} from "@/lib/engines/calculationEngine"

export const dynamic = "force-dynamic"

export default async function LaporanPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const period = (await searchParams).period || 'today'
  
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  
  let label = "Hari Ini"
  if (period === '7days') {
    startDate.setDate(startDate.getDate() - 6)
    label = "7 Hari Terakhir"
  } else if (period === 'month') {
    startDate.setDate(1)
    label = "Bulan Ini"
  }

  // 1. Ambil Angka Murni dari Calculation Engine
  const omzet = await calculateOmzet(business.id, startDate, endDate)
  const txCount = await calculateTransactionCount(business.id, startDate, endDate)
  const aov = calculateAOV(omzet, txCount)
  const hpp = await calculateTotalHPP(business.id, startDate, endDate)
  const expenses = await calculateExpenses(business.id, startDate, endDate)
  
  // Income lain (selain POS). Untuk MVP, karena belum ada UI Uang Masuk, asumsikan 0.
  const incomeLain = 0 
  
  // 2. Kalkulasi Bisnis
  const grossProfit = calculateGrossProfit(omzet + incomeLain, hpp)
  const margin = calculateMargin(grossProfit, omzet + incomeLain)
  const netProfit = calculateNetProfit(grossProfit, expenses)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto pb-20">
      <div className="bg-blue-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl">
        <Link href="/" className="text-white text-sm font-semibold mb-4 inline-block">← Beranda</Link>
        <h1 className="text-xl font-bold">Laporan Usaha</h1>
      </div>
      
      <div className="p-4 -mt-6">
        {/* Filter */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm w-max mx-auto text-sm">
          <Link href="/laporan?period=today" className={`px-4 py-1.5 rounded-md font-semibold ${period === 'today' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Hari Ini</Link>
          <Link href="/laporan?period=7days" className={`px-4 py-1.5 rounded-md font-semibold ${period === '7days' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>7 Hari</Link>
          <Link href="/laporan?period=month" className={`px-4 py-1.5 rounded-md font-semibold ${period === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Bulan Ini</Link>
        </div>

        <div className="space-y-3">
          {/* Box Omzet */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-semibold">Omzet {label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Rp {omzet.toLocaleString('id-ID')}</p>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-500">Jumlah Transaksi: <b className="text-gray-900">{txCount}</b></p>
              <p className="text-xs text-gray-500">Rata-rata (AOV): <b className="text-gray-900">Rp {aov.toLocaleString('id-ID')}</b></p>
            </div>
          </div>

          {/* Box HPP & Kotor */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-gray-600">Total Modal (HPP)</p>
              <p className="text-sm font-bold text-orange-600">Rp {hpp.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p className="text-sm text-gray-600">Uang Masuk Lain</p>
              <p className="text-sm font-bold text-gray-900">Rp 0</p>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-50">
              <p className="text-sm text-gray-800 font-bold">Untung Kotor</p>
              <div className="text-right">
                <p className="text-lg font-bold text-green-700">Rp {grossProfit.toLocaleString('id-ID')}</p>
                <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">Margin {margin}%</p>
              </div>
            </div>
          </div>

          {/* Box Pengeluaran & Bersih */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-600">Pengeluaran Operasional</p>
              <p className="text-sm font-bold text-red-600">- Rp {expenses.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <p className="text-sm font-bold text-gray-900">Untung Bersih</p>
              <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>Rp {netProfit.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
