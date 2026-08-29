import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { formatNumber } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminMarketingPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }
  
  return (
    <AdminLayout activeMenu="marketing">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Marketing Attribution</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Menjawab pertanyaan: Campaign mana yang menghasilkan user, activation, dan paid user?</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Campaign Performance (UTM Tracking)</h3>
            <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded border border-rose-200 tracking-widest">DATA BELUM TERSEDIA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4">UTM Campaign</th>
                  <th className="p-4">Source / Medium</th>
                  <th className="p-4">Leads</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4">Activated</th>
                  <th className="p-4">Paid User</th>
                  <th className="p-4">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <p className="text-sm text-gray-500 font-medium mb-2">Sistem belum merekam jejak atribusi pemasaran (UTM parameter).</p>
                    <p className="text-xs text-gray-400">Skema membutuhkan tambahan layer UTM (utm_source, utm_medium, utm_campaign, utm_content, utm_term) saat registrasi.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
