import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProductClient from "./EditProductClient"
import { checkIsVIP } from "@/lib/vip"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const id = (await params).id
  const [product, suppliers] = await Promise.all([
    prisma.product.findUnique({ 
      where: { id },
      include: { business: true }
    }),
    prisma.supplier.findMany({
      where: { business: { userId: session.user.id } },
      orderBy: { name: 'asc' }
    })
  ])
  
  if (!product || product.business.userId !== session.user.id) redirect("/katalog")
  
  const isVIP = await checkIsVIP(session.user.id);
  return <EditProductClient product={product} suppliers={suppliers} isVIP={isVIP} />
}
