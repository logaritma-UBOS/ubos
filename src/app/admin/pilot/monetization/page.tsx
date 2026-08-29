import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function MonetizationPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  return (
    <AdminLayout activeMenu="monetization" logoutAction={async () => {
      "use server"
      const cookiesList = await cookies()
      cookiesList.delete("ubos_pilot_auth")
      redirect("/admin/pilot")
    }}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Monetization Intelligence</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Status pendapatan dari langganan User UBOS</p>
        </div>
        
        <div className="bg-slate-100 p-10 rounded-2xl border border-slate-200 text-center">
          <h2 className="text-xl font-black text-slate-500 mb-2 tracking-widest uppercase">DATA BELUM TERSEDIA</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
            UBOS belum memiliki skema Subscription, Membership, atau In-App Payment yang aktif di tingkat codebase utama.
            Halaman ini disiapkan secara arsitektur untuk melacak MRR (Monthly Recurring Revenue) dari pembayaran langsung pengguna ke platform UBOS (bukan omzet merchant).
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
