import AppShell from "@/components/layout/AppShell"
import PegawaiClient from "./PegawaiClient"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PegawaiPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Hanya owner yang boleh akses halaman pengaturan pegawai
  if (session.user.role !== "OWNER") {
    redirect("/beranda")
  }

  const whereClause = (session.user as any).staffBusinessId ? { id: (session.user as any).staffBusinessId } : { userId: session.user.id };
  const business = await prisma.business.findFirst({ where: whereClause })

  return (
    <AppShell businessName={business?.name}>
      <PegawaiClient />
    </AppShell>
  )
}
