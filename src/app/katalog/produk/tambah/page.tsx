import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TambahProdukClient from "./TambahProdukClient"

export default async function TambahProdukServer() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  return <TambahProdukClient businessType={business.businessType} />
}
