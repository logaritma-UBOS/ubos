import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export const dynamic = "force-dynamic"

export default async function AdminLeadsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot")
  }

  const totalUsers = await prisma.user.count()
  const allBusinesses = await prisma.business.findMany({
    include: {
      products: { select: { id: true } },
      ingredients: { select: { id: true } },
      sales: { select: { id: true } }
    }
  })
  
  const totalBusinesses = allBusinesses.length
  let businessesWithData = 0
  
  for (const b of allBusinesses) {
    if (b.products.length > 0 || b.ingredients.length > 0) businessesWithData++
  }

  return (
    <AdminLayout activeMenu="leads">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Leads Funnel</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Siklus pengunjung hingga menjadi lead dan user berbayar di UBOS</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Acquisition & Lead Journey</h3>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Tahap 1</span>
                <span className="font-bold text-gray-900 text-lg">VISITOR (Traffic)</span>
                <p className="text-xs text-gray-500 mt-1">Pengunjung landing page ubos.logaritma.id</p>
              </div>
              <span className="font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 mt-4 md:mt-0 text-center">DATA BELUM TERSEDIA</span>
            </div>
            
            <div className="w-1 h-6 bg-gray-200 mx-auto rounded-full"></div>
            
            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Tahap 2</span>
                <span className="font-bold text-gray-900 text-lg">LEAD (Meninggalkan Kontak)</span>
                <p className="text-xs text-gray-500 mt-1">Mengisi form CTA namun belum verifikasi akun</p>
              </div>
              <span className="font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 mt-4 md:mt-0 text-center">DATA BELUM TERSEDIA</span>
            </div>

            <div className="w-1 h-6 bg-gray-200 mx-auto rounded-full"></div>

            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-1">Tahap 3</span>
                <span className="font-bold text-blue-900 text-lg">REGISTERED</span>
                <p className="text-xs text-blue-700 mt-1">User berhasil login/membuat akun</p>
              </div>
              <span className="font-black text-blue-700 bg-white px-6 py-2 rounded-xl border border-blue-100 mt-4 md:mt-0 text-center text-xl">{totalUsers}</span>
            </div>

            <div className="w-1 h-6 bg-blue-200 mx-auto rounded-full"></div>

            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-amber-50 rounded-2xl border border-amber-100">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">Tahap 4</span>
                <span className="font-bold text-amber-900 text-lg">BUSINESS CREATED</span>
                <p className="text-xs text-amber-700 mt-1">Membuat profil bisnis UMKM</p>
              </div>
              <span className="font-black text-amber-700 bg-white px-6 py-2 rounded-xl border border-amber-100 mt-4 md:mt-0 text-center text-xl">{totalBusinesses}</span>
            </div>

            <div className="w-1 h-6 bg-amber-200 mx-auto rounded-full"></div>

            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1">Tahap 5</span>
                <span className="font-bold text-emerald-900 text-lg">ACTIVATED (First Data)</span>
                <p className="text-xs text-emerald-700 mt-1">Memasukkan produk atau bahan baku pertama</p>
              </div>
              <span className="font-black text-emerald-700 bg-white px-6 py-2 rounded-xl border border-emerald-100 mt-4 md:mt-0 text-center text-xl">{businessesWithData}</span>
            </div>

            <div className="w-1 h-6 bg-emerald-200 mx-auto rounded-full"></div>

            <div className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Tahap 6</span>
                <span className="font-bold text-gray-900 text-lg">PAID</span>
                <p className="text-xs text-gray-500 mt-1">User melakukan monetization event (langganan)</p>
              </div>
              <span className="font-black text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 mt-4 md:mt-0 text-center">DATA BELUM TERSEDIA</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
