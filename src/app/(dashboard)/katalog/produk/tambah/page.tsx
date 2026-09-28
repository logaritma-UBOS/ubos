import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TambahProdukClient from "./TambahProdukClient"
import { getUserPlan } from "@/lib/plan"
import Link from "next/link"

export default async function TambahProdukServer() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const plan = await getUserPlan()
  if (plan === "STARTER") {
    const productCount = await prisma.product.count({ where: { businessId: business.id } })
    if (productCount >= 15) {
      return (
        <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-3xl border border-rose-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Batas Katalog Tercapai</h2>
          <p className="text-slate-600 mb-6">Paket Starter (Gratis) maksimal 15 produk. Tingkatkan ke paket PRO atau Founder Pass untuk menambah katalog tanpa batas (Unlimited).</p>
          <div className="flex flex-col gap-3">
            <Link href="/founder" className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors">
              Upgrade Sekarang
            </Link>
            <Link href="/katalog" className="text-slate-500 font-medium hover:text-slate-700">
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      )
    }
  }

  return <TambahProdukClient businessType={business.businessType} />
}
