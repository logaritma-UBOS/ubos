import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditIngredientClient from "./EditIngredientClient"

export default async function EditIngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const ingredient = await prisma.ingredient.findUnique({ where: { id } })
  
  if (!ingredient) redirect("/katalog")
  
  return <EditIngredientClient ingredient={ingredient} />
}
