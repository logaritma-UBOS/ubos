import { auth } from "@/auth"
import { redirect } from "next/navigation"
import BusinessInsightsClient from "./BusinessInsightsClient"

export const dynamic = "force-dynamic"

export default async function BusinessInsightsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  return <BusinessInsightsClient />
}
