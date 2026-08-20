export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import KasirClient from "./KasirClient"

export default async function KasirPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const products = await prisma.product.findMany({ where: { businessId: business.id } })

  return <KasirClient products={products} />
}
