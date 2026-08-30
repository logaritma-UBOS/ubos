import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function activateCampaign(formData: FormData) {
  "use server"
  const id = formData.get("id")?.toString()
  if (!id) return
  await prisma.ownerCampaign.update({
    where: { id },
    data: { status: "ACTIVE", startAt: new Date() }
  })
  revalidatePath("/admin/pilot/campaigns")
}

export default async function MarketingPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const campaigns = await prisma.ownerCampaign.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <AdminLayout activeMenu="campaigns">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Marketing & Kampanye</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Eksekusi pesan dorongan kepada pengguna.</p>
        </div>

        {campaigns.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <h2 className="text-slate-500 font-bold">Belum Ada Kampanye</h2>
            <p className="text-sm text-slate-400 mt-2">Buat kampanye dari halaman Peluang atau Aksi.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600">Nama Kampanye</th>
                  <th className="p-4 font-bold text-slate-600">Pesan</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                  <th className="p-4 font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-medium text-slate-900">{c.name}</td>
                    <td className="p-4 text-slate-600 line-clamp-1">{c.message}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {c.status === "DRAFT" && (
                        <form action={activateCampaign}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800">
                            Aktifkan
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
