"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { updateProductHpp } from "@/lib/engines/hppEngine"
import { redirect } from "next/navigation"
import { trackEvent, logError } from "@/actions/analytics"

async function getBusinessId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) throw new Error("Business not found")
  return business.id
}

export async function addIngredient(prevState: any, formData: FormData) {
  try {
    const businessId = await getBusinessId()
    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const costPerUnit = parseFloat(formData.get("costPerUnit") as string) || 0
    const currentStock = parseFloat(formData.get("currentStock") as string) || 0

    if (!name || !unit) return { error: "Nama dan satuan wajib diisi" }

    await prisma.ingredient.create({
      data: { businessId, name, unit, costPerUnit, currentStock }
    })
    trackEvent(businessId, "catalog_updated", { type: "ingredient_created" }).catch(()=>{})
  } catch (e: any) {
    logError("CATALOG_ERROR", e.message, undefined, e.stack, "/katalog/bahan/tambah").catch(()=>{})
    return { error: e.message }
  }
  redirect("/katalog")
}

export async function addRecipeItem(formData: FormData) {
  try {
    const businessId = await getBusinessId()
    const productId = formData.get("productId") as string
    const ingredientId = formData.get("ingredientId") as string
    const quantityNeeded = parseFloat(formData.get("quantityNeeded") as string) || 0

    // SECURITY: Verifikasi kepemilikan
    const p = await prisma.product.findFirst({ where: { id: productId, businessId } })
    const i = await prisma.ingredient.findFirst({ where: { id: ingredientId, businessId } })
    if (!p || !i) return { error: "Unauthorized" }

    await prisma.recipe.create({
      data: { businessId, productId, ingredientId, quantityNeeded }
    })

    // Trigger HPP Engine
    await updateProductHpp(productId)
    trackEvent(businessId, "hpp_created", { productId }).catch(()=>{})

  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath(`/katalog/produk/${formData.get("productId")}`)
  return { success: true }
}

export async function addProduct(prevState: any, formData: FormData) {
  try {
    const businessId = await getBusinessId()
    const name = formData.get("name") as string
    const sellPrice = parseFloat(formData.get("sellPrice") as string) || 0
    if (!name || sellPrice <= 0) return { error: "Nama dan Harga Jual wajib diisi" }
    await prisma.product.create({ data: { businessId, name, sellPrice } })
    trackEvent(businessId, "product_created", { name }).catch(()=>{})
  } catch (e: any) {
    logError("CATALOG_ERROR", e.message, undefined, e.stack, "/katalog/produk/tambah").catch(()=>{})
    return { error: e.message }
  }
  revalidatePath("/katalog")
  redirect("/katalog")
}

export async function editProduct(prevState: any, formData: FormData) {
  try {
    const businessId = await getBusinessId()
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const sellPrice = parseFloat(formData.get("sellPrice") as string) || 0
    if (!name || sellPrice <= 0) return { error: "Nama dan Harga Jual wajib diisi" }
    
    // SECURITY: Verifikasi kepemilikan
    const existing = await prisma.product.findFirst({ where: { id, businessId } })
    if (!existing) return { error: "Unauthorized" }

    await prisma.product.update({ where: { id }, data: { name, sellPrice } })
    await updateProductHpp(id)
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath("/katalog")
  redirect("/katalog")
}

export async function editIngredient(prevState: any, formData: FormData) {
  try {
    const businessId = await getBusinessId()
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const unit = formData.get("unit") as string
    const costPerUnit = parseFloat(formData.get("costPerUnit") as string) || 0
    const currentStock = parseFloat(formData.get("currentStock") as string) || 0
    if (!name || !unit) return { error: "Nama dan Satuan wajib diisi" }
    
    // SECURITY: Verifikasi kepemilikan
    const existing = await prisma.ingredient.findFirst({ where: { id, businessId } })
    if (!existing) return { error: "Unauthorized" }

    await prisma.ingredient.update({ where: { id }, data: { name, unit, costPerUnit, currentStock } })
    
    // Auto update HPP for all products using this ingredient
    const recipes = await prisma.recipe.findMany({ where: { ingredientId: id } })
    for (const r of recipes) {
      await updateProductHpp(r.productId)
    }
  } catch (e: any) {
    return { error: e.message }
  }
  revalidatePath("/katalog")
  redirect("/katalog")
}

export async function deleteProductSecure(id: string) {
  const businessId = await getBusinessId()
  await prisma.product.deleteMany({ where: { id, businessId } })
  revalidatePath("/katalog")
}

export async function deleteIngredientSecure(id: string) {
  const businessId = await getBusinessId()
  await prisma.ingredient.deleteMany({ where: { id, businessId } })
  revalidatePath("/katalog")
}

export async function deleteRecipeItemSecure(id: string, productId: string) {
  const businessId = await getBusinessId()
  // Ensure the recipe belongs to this business (by joining product)
  const product = await prisma.product.findFirst({ where: { id: productId, businessId } })
  if (product) {
    await prisma.recipe.deleteMany({ where: { id, productId: product.id } })
    await updateProductHpp(productId)
  }
  revalidatePath(`/katalog/produk/${productId}`)
}
