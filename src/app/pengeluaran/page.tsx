import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { deleteExpense } from "@/actions/finance"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function PengeluaranPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const expenses = await prisma.expense.findMany({
    where: { businessId: business.id },
    orderBy: { date: "desc" }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto pb-20">
      <div className="bg-red-700 text-white p-4 pb-6 shrink-0 rounded-b-3xl">
        <div className="flex justify-between items-center mb-2">
          <Link href="/" className="text-white text-sm font-semibold">← Beranda</Link>
          <Link href="/pengeluaran/tambah" className="bg-white text-red-700 px-3 py-1 text-sm font-bold rounded-full">+ Catat</Link>
        </div>
        <h1 className="text-xl font-bold">Pengeluaran</h1>
      </div>
      
      <div className="p-4 space-y-3 -mt-4">
        {expenses.map(exp => (
          <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900">{exp.category}</p>
              <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString('id-ID')} - {exp.description || 'Tidak ada catatan'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">Rp {exp.amount.toLocaleString('id-ID')}</p>
              <form action={async () => {
                "use server"
                try {
                  await prisma.expense.delete({ where: { id: exp.id } })
                } catch(e){}
                revalidatePath("/pengeluaran")
              }}>
                <button type="submit" className="text-red-400 text-xs font-bold mt-1">Hapus</button>
              </form>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Belum ada catatan pengeluaran.</p>
          </div>
        )}
      </div>
    </div>
  )
}
