import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CampaignsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Campaign Intelligence</h1>
      
      <div className="bg-slate-100 p-10 rounded-2xl border border-slate-200 text-center">
        <h2 className="text-xl font-bold text-slate-700 mb-2">STRUKTUR CAMPAIGN SIAP</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Arsitektur campaign untuk menghubungkan Segment -&gt; Trigger -&gt; Message -&gt; Offer siap dijalankan.
          Saat ini belum ada data campaign aktif yang bisa dievaluasi.
        </p>
      </div>
    </div>
  )
}
