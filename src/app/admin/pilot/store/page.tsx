import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminStorePage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  return (
    <AdminLayout activeMenu="store">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Service / Store</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manajemen produk digital & commercial layer ekosistem UBOS</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Produk Belum Tersedia</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Database belum memiliki skema abstraksi Product/Offer yang memadai untuk mengatur landing page, harga, atau CTA secara terpusat.
          </p>
          <span className="px-4 py-2 bg-rose-50 text-rose-600 font-black tracking-widest text-xs rounded-lg border border-rose-100 uppercase">
            DATA BELUM TERSEDIA
          </span>
        </div>
      </div>
    </AdminLayout>
  )
}
