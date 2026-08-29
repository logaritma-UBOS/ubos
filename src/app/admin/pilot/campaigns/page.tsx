import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

async function activateCampaign(formData: FormData) {
  "use server"
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") throw new Error("Unauthorized");

  const campaignId = formData.get("campaignId")?.toString();
  if (!campaignId) return;

  const campaign = await prisma.ownerCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return;

  // Real intelligence: find users based on the campaign's targetSegment
  let eligibleUserIds: string[] = [];
  
  if (campaign.targetSegment === 'HPP_NOT_TRANSACTED') {
    // Has HPP but no POS
    const hppEvents = await prisma.pilotEvent.findMany({ where: { eventName: 'hpp_created' }, select: { businessId: true } });
    const posEvents = await prisma.pilotEvent.findMany({ where: { eventName: 'pos_transaction_completed' }, select: { businessId: true } });
    const hasHpp = new Set(hppEvents.map(e => e.businessId));
    const hasPos = new Set(posEvents.map(e => e.businessId));
    
    // Find businesses with HPP but no POS
    const targetBusinessIds = Array.from(hasHpp).filter(id => !hasPos.has(id) && id !== "");
    const targetBiz = await prisma.business.findMany({ where: { id: { in: targetBusinessIds } }, select: { userId: true } });
    eligibleUserIds = targetBiz.map(b => b.userId);
  } else if (campaign.targetSegment === 'DORMANT_14D') {
    // 14 days dormant
    const fourteenDaysAgo = new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentEvents = await prisma.pilotEvent.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { businessId: true } });
    const activeBiz = new Set(recentEvents.map(e => e.businessId));
    
    const allBiz = await prisma.business.findMany({ select: { id: true, userId: true } });
    const dormantBiz = allBiz.filter(b => !activeBiz.has(b.id));
    eligibleUserIds = dormantBiz.map(b => b.userId);
  } else {
    // Fallback: everyone
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    eligibleUserIds = allUsers.map(u => u.id);
  }

  // Deduplicate user IDs
  eligibleUserIds = Array.from(new Set(eligibleUserIds));

  // Update campaign
  await prisma.ownerCampaign.update({
    where: { id: campaignId },
    data: {
      status: "ACTIVE",
      startAt: new Date(),
      eligibleUsers: eligibleUserIds.length,
      targetUsers: eligibleUserIds.length,
      queued: eligibleUserIds.length
    }
  });

  // Create notifications queue
  if (eligibleUserIds.length > 0) {
    const notifications = eligibleUserIds.map(uid => ({
      recipientId: uid,
      segment: campaign.targetSegment,
      trigger: `CAMPAIGN_${campaignId}`,
      reason: campaign.objective,
      message: campaign.message,
      channel: campaign.channel,
      status: "READY", // NOT "SENT" because gateway is not connected
      priority: "HIGH"
    }));
    await prisma.ownerNotification.createMany({ data: notifications });
  }

  revalidatePath("/admin/pilot/campaigns");
}

export default async function CampaignsPage() {
  const cookieStore = await cookies()
  if (cookieStore.get("ubos_pilot_auth")?.value !== "authenticated") {
    redirect("/admin/pilot/login")
  }

  const campaigns = await prisma.ownerCampaign.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <AdminLayout activeMenu="campaigns" logoutAction={async () => {
      "use server"
      const cookiesList = await cookies()
      cookiesList.delete("ubos_pilot_auth")
      redirect("/admin/pilot")
    }}>
      <div className="p-4 md:p-8 space-y-8 bg-slate-50/50 min-h-full">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Intelligence Center</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Eksekusi marketing campaign dan pantau konversinya</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Campaign Name</th>
                <th className="px-4 py-3">Objective & Message</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Target Users</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada data campaign aktif. Klik "Accept & Execute" di Control Center untuk membuat campaign dari Opportunity.
                  </td>
                </tr>
              ) : campaigns.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800 font-medium">{c.objective}</p>
                    <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">"{c.message}"</p>
                  </td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[9px] uppercase tracking-wider font-bold">{c.targetSegment}</span></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-wider font-black ${
                      c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                      c.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-black text-slate-900">{c.targetUsers}</p>
                    {c.status !== 'DRAFT' && (
                      <div className="text-[9px] font-bold mt-1 flex flex-col gap-0.5 items-end">
                        <span className="text-slate-500">{c.queued} Queued</span>
                        <span className="text-blue-500">{c.delivered} Delivered</span>
                        <span className="text-amber-500">{c.opened} Opened</span>
                        <span className="text-purple-500">{c.clicked} Clicked</span>
                        <span className="text-emerald-600">{c.converted} Converted</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "DRAFT" && (
                      <form action={activateCampaign}>
                        <input type="hidden" name="campaignId" value={c.id} />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">
                          Activate & Queue
                        </button>
                      </form>
                    )}
                    {c.status === "ACTIVE" && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Running</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
