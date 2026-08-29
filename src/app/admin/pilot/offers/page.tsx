import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function OffersPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  const offers = await prisma.ownerOffer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout activeMenu="offers" logoutAction={async () => {
      "use server"
      const cookiesList = await cookies()
      cookiesList.delete("ubos_pilot_auth")
      redirect("/admin/pilot")
    }}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Offers Center</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Offer Name</th>
                <th className="px-4 py-3">Target Segment</th>
                <th className="px-4 py-3">CTA</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    EMPTY STATE: Belum ada konfigurasi Offer. Intelligence Engine mendeteksi belum adanya sistem payment/subscription yang terhubung.
                  </td>
                </tr>
              ) : offers.map(o => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{o.name}</td>
                  <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">{o.targetSegment}</span></td>
                  <td className="px-4 py-3 text-slate-600">{o.cta}</td>
                  <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
