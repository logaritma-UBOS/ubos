import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StrukClient from "./StrukClient"

export default async function StrukPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { settings: true }
  })

  if (!business) redirect("/onboarding")

  const sale = await prisma.sale.findFirst({
    where: { 
      clientTransactionId: params.id,
      businessId: business.id // TENANT ISOLATION
    },
    include: {
      saleItems: {
        include: { product: true }
      }
    }
  })

  if (!sale) redirect("/kasir")

  return <StrukClient sale={sale} business={business} />
}
