import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SalesTimeClient from "./SalesTimeClient"
import AppShell from "@/components/layout/AppShell"

export const dynamic = "force-dynamic"

export default async function SalesTimePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  return <AppShell><SalesTimeClient /></AppShell>
}
