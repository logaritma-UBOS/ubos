"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteIngredient(id: string) {
  try { await prisma.ingredient.delete({ where: { id } }) } catch(e) {}
  revalidatePath("/katalog")
}

export async function deleteProduct(id: string) {
  try { await prisma.product.update({ where: { id }, data: { isActive: false } }) } catch (e) {}
  revalidatePath("/katalog")
}
