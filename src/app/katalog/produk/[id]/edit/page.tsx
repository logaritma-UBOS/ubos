import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProductClient from "./EditProductClient"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const id = (await params).id
  const product = await prisma.product.findUnique({ 
    where: { id },
    include: { business: true }
  })
  
  if (!product || product.business.userId !== session.user.id) redirect("/katalog")
  
  return <EditProductClient product={product} />
}
