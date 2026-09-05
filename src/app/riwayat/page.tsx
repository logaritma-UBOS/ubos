import { auth } from "@/auth"
import { redirect } from "next/navigation"
import RiwayatClient from "./RiwayatClient"
import AppShell from "@/components/layout/AppShell"

export const dynamic = "force-dynamic"

export default async function RiwayatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  return <AppShell><RiwayatClient /></AppShell>
}
