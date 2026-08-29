import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MonetizationPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Monetization Intelligence</h1>
      
      <div className="bg-slate-100 p-10 rounded-2xl border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-2">DATA BELUM TERSEDIA</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          UBOS belum memiliki skema Subscription, Membership, atau In-App Payment yang aktif.
          Halaman ini disiapkan untuk melacak MRR (Monthly Recurring Revenue) dari pembayaran langsung pengguna ke UBOS.
        </p>
      </div>
    </div>
  )
}
