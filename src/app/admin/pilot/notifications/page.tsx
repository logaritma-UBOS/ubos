import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  const notifications = await prisma.ownerNotification.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout activeMenu="notifications" logoutAction={async () => {
      "use server"
      const cookiesList = await cookies()
      cookiesList.delete("ubos_pilot_auth")
      redirect("/admin/pilot")
    }}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Trigger / Segment</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada notifikasi di queue. Sistem akan mengenerate berdasarkan event Logaritma secara otomatis.
                  </td>
                </tr>
              ) : notifications.map(n => (
                <tr key={n.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{n.segment || n.trigger}</td>
                  <td className="px-4 py-3 text-slate-600 line-clamp-1">{n.message}</td>
                  <td className="px-4 py-3"><span className="text-xs font-bold uppercase">{n.priority}</span></td>
                  <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold">{n.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
