import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function CampaignsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  const campaigns = await prisma.ownerCampaign.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout activeMenu="campaigns" logoutAction={async () => {
      "use server"
      const cookiesList = await cookies()
      cookiesList.delete("ubos_pilot_auth")
      redirect("/admin/pilot")
    }}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Intelligence Center</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Campaign Name</th>
                <th className="px-4 py-3">Objective</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Target Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data campaign aktif. Klik "Accept & Execute" di Control Center untuk membuat campaign dari Opportunity.
                  </td>
                </tr>
              ) : campaigns.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.objective}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{c.targetSegment}</span></td>
                  <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">{c.status}</span></td>
                  <td className="px-4 py-3 text-right font-black">{c.targetUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
