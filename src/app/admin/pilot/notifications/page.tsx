import { cookies } from "next/headers"
import AdminLayout from "@/components/admin/AdminLayout"
export const dynamic = "force-dynamic"
export default async function NotificationsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") return <div className="p-8">Unauthorized</div>
  return (
    <AdminLayout activeMenu="notifications">
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Daftar blast dan notifikasi otomatis (Logaritma Marketing Engine)</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm">Belum ada channel notifikasi (WhatsApp/Email) yang tersambung ke production. Data notifikasi kosong.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
