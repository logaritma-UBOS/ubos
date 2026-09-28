import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUserPlan } from "@/lib/plan"
import FreemiumLock from "@/components/layout/FreemiumLock"
import BusinessInsightsClient from "./BusinessInsightsClient"

export const dynamic = "force-dynamic"

export default async function BusinessInsightsPage() {
  const session = await auth()
  const plan = await getUserPlan()
  if (plan === "STARTER") return <AppShell><FreemiumLock featureName="Wawasan Bisnis" /></AppShell>
  if (!session?.user?.id) redirect("/login")
  
  return (
          <BusinessInsightsClient />
      )
}
