import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function PenjualanPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const activeOffers = await prisma.ownerOffer.count()

  return (
    <AdminLayout activeMenu="monetization">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Penjualan UBOS</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Performa langganan dan transaksi pembayaran (Revenue).</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
          <h2 className="text-amber-800 font-black uppercase text-sm tracking-wider mb-2">Sistem Pembayaran Belum Tersedia</h2>
          <p className="text-sm text-amber-700">
            Sistem pembayaran berlangganan (Monetisasi) belum diaktifkan pada ekosistem saat ini. Halaman ini akan memunculkan metrik Gross Revenue, Paying Users, dan Average Order Value (AOV) setelah infrastruktur pembayaran selesai dibangun.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
