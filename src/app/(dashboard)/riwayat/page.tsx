import { auth } from "@/auth"
import { redirect } from "next/navigation"
import RiwayatClient from "./RiwayatClient"
import { getUserPlan } from "@/lib/plan"

export const dynamic = "force-dynamic"

export default async function RiwayatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const plan = await getUserPlan()
  
  return <RiwayatClient plan={plan} />
}
