export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MarketingClient from "./MarketingClient"
import Link from "next/link"
import { getCampaigns } from "@/actions/campaign"

export default async function MarketingPage() {
  const session = await auth()
  const plan = "Pro"
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id }
  })
  if (!business) redirect("/onboarding")

  const [campaigns, contentPlans, promos] = await Promise.all([
    getCampaigns(),
    prisma.contentPlan.findMany({ where: { businessId: business.id } }),
    prisma.promo.findMany({ where: { businessId: business.id, isActive: true } })
  ])

  let isVip = false;
  if (session.user.email === "warunkarsi23@gmail.com") {
    isVip = true;
  } else {
    const payment = await prisma.ubosRevenue.findFirst({
      where: { userId: session.user.id, status: "PAID" }
    });
    if (payment) isVip = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">? Kembali</Link>
          <div className="flex-1 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Marketing Engine</h1>
            </div>
        </div>
        <MarketingClient initialCampaigns={campaigns} contentPlans={contentPlans} promos={promos} isVip={isVip} />
      </div>
    </div>
  )
}





