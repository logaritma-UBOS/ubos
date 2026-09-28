import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TambahProdukClient from "./TambahProdukClient"
import { checkIsVIP } from "@/lib/vip"

export default async function TambahProdukServer() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const isVIP = await checkIsVIP(session.user.id);
  return <TambahProdukClient businessType={business.businessType} isVIP={isVIP} />
}
