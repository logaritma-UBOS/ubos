import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminSubscriptionPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  return (
    <AdminLayout activeMenu="subscription">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription Engine</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Pemantauan monetisasi, plan, dan Monthly Recurring Revenue (MRR)</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Free Users", "Trial Users", "Active Paid", "Churn Rate"].map((label, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 opacity-60">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
              <p className="text-lg font-black text-gray-400">N/A</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px] flex flex-col items-center justify-center p-8 text-center mt-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sistem Subscription Belum Aktif</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Database belum memiliki model Subscription/Payment sehingga pencatatan MRR, Renewal, dan Churn tidak dapat dilakukan.
          </p>
          <span className="px-4 py-2 bg-rose-50 text-rose-600 font-black tracking-widest text-xs rounded-lg border border-rose-100 uppercase">
            DATA BELUM TERSEDIA
          </span>
        </div>
      </div>
    </AdminLayout>
  )
}
