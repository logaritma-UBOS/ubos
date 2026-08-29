import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  // Fetch all users with their business relations
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      businesses: {
        include: {
          products: { select: { id: true } },
          sales: { select: { id: true } }
        }
      }
    }
  })

  return (
    <AdminLayout activeMenu="users">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users Journey</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Lacak aktivitas nyata dari user UBOS</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">User</th>
                  <th className="p-4">Tanggal Daftar</th>
                  <th className="p-4">Journey / Status</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Transaksi POS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => {
                  const hasBusiness = user.businesses.length > 0
                  const business = hasBusiness ? user.businesses[0] : null
                  const hasProduct = business ? business.products.length > 0 : false
                  const hasSale = business ? business.sales.length > 0 : false
                  
                  let statusColor = "bg-gray-100 text-gray-600"
                  let statusText = "Registered"
                  
                  if (hasSale) {
                    statusColor = "bg-emerald-100 text-emerald-700"
                    statusText = "Active (POS)"
                  } else if (hasProduct) {
                    statusColor = "bg-blue-100 text-blue-700"
                    statusText = "Onboarding"
                  } else if (hasBusiness) {
                    statusColor = "bg-amber-100 text-amber-700"
                    statusText = "Biz Created"
                  }

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-bold text-sm text-gray-900">{user.name || "No Name"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-medium">
                        {business ? business.name : "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {business ? business.sales.length : 0}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">Belum ada data user.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
