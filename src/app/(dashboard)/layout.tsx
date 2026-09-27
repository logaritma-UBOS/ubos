import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AppShell from "@/components/layout/AppShell"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  let businessName = "UBOS"
  const business = await prisma.business.findFirst({ 
    where: { userId: session.user.id } 
  })
  
  if (business) {
    businessName = business.name
  }

  return (
    <AppShell businessName={businessName}>
      {children}
    </AppShell>
  )
}
