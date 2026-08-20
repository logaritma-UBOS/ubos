import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditProductClient from "./EditProductClient"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const product = await prisma.product.findUnique({ where: { id } })
  
  if (!product) redirect("/katalog")
  
  return <EditProductClient product={product} />
}
