import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { getOwnerOpportunities } from "@/lib/owner/opportunityEngine"
import { formatNumber } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function acceptOpportunity(formData: FormData) {
  "use server"
  const opportunityId = formData.get("opportunityId")?.toString()
  const metric = formData.get("metric")?.toString() || ""
  const recommendation = formData.get("recommendation")?.toString() || ""
  const expectedResult = formData.get("expectedResult")?.toString() || ""
  
  if (!opportunityId) return
  
  await prisma.ownerAction.create({
    data: {
      source: opportunityId,
      metric,
      actionType: "MARKETING_CAMPAIGN",
      recommendation,
      expectedResult,
      actualBefore: 0,
      target: 0,
      gapBefore: 0,
      severity: "HIGH",
      confidence: "HIGH",
      direction: "HIGHER_IS_BETTER",
      status: "ACCEPTED"
    }
  })

  await prisma.ownerCampaign.create({
    data: {
      name: `${metric} Push`,
      objective: recommendation,
      targetSegment: metric,
      message: recommendation,
      status: "DRAFT",
      expectedResult: expectedResult
    }
  })
  
  revalidatePath("/admin/pilot/leads")
}

export default async function PeluangPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") redirect("/admin/pilot")

  const opportunities = await getOwnerOpportunities()

  return (
    <AdminLayout activeMenu="leads">
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Peluang & Masalah Utama</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Daftar potensi perbaikan yang paling bernilai untuk bisnis saat ini.</p>
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <h2 className="text-slate-500 font-bold">Belum Ada Peluang Mendesak</h2>
            <p className="text-sm text-slate-400 mt-2">Mesin belum mendeteksi masalah atau peluang baru yang signifikan saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {opportunities.map((opp, i) => (
              <div key={opp.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div>
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded ${opp.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      Prioritas {opp.severity}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-slate-900">{opp.diagnosis}</h3>
                    <p className="text-sm text-slate-500 mt-1"><strong>Penyebab:</strong> {opp.evidence}</p>
                  </div>
                </div>
                
                <div className="flex-1 md:border-l border-slate-100 md:pl-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Dampak (Pengguna)</p>
                      <p className="text-xl font-black text-slate-700">{formatNumber(opp.affectedUsers)}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-500">Rekomendasi Aksi</p>
                    <p className="text-sm font-bold text-blue-900">{opp.recommendedAction}</p>
                    <form action={acceptOpportunity} className="mt-3">
                      <input type="hidden" name="opportunityId" value={opp.id} />
                      <input type="hidden" name="metric" value={opp.targetSegment} />
                      <input type="hidden" name="recommendation" value={opp.recommendedAction} />
                      <input type="hidden" name="expectedResult" value={opp.expectedResult} />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded shadow-sm transition-colors">
                        Jadikan Kampanye
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
