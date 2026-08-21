"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAudit } from "@/lib/auditLogger"
import { trackEvent, logError } from "@/actions/analytics"

type CartItem = {
  productId: string
  quantity: number
  price: number
}

export async function checkoutSale(cart: CartItem[], totalAmount: number, clientTransactionId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }
    
    const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
    if (!business) return { error: "Business not found" }

  // Prevent duplicate via clientTransactionId (Offline-First preparation)
  const existing = await prisma.sale.findUnique({ where: { clientTransactionId } })
  if (existing) return { success: true }

  // SECURITY: Verifikasi kepemilikan produk dalam keranjang
  const productIds = cart.map(c => c.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, businessId: business.id } })
  if (products.length !== productIds.length) return { error: "Terjadi kesalahan: Produk tidak valid." }
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  await prisma.$transaction(async (tx) => {
    // 1. Catat Penjualan
    await tx.sale.create({
      data: {
        businessId: business.id,
        clientTransactionId,
        totalAmount,
        paymentMethod: "CASH",
        saleItems: {
          create: cart.map(c => ({
            businessId: business.id,
            productId: c.productId,
            quantity: c.quantity,
            priceAtSale: c.price,
            hppAtSale: productMap[c.productId]?.calculatedHpp || 0
          }))
        }
      }
    })

    // 2. Data Chain: Kurangi Stok Berdasarkan Perilaku Item (BOM vs RETAIL)
    for (const item of cart) {
      const p = productMap[item.productId];
      
      // Jika BOM (F&B / Hybrid): Kurangi stok bahan baku (ingredient)
      if (p.hasBOM) {
        const recipes = await tx.recipe.findMany({ where: { productId: item.productId } })
        for (const r of recipes) {
          const qtyToReduce = r.quantityNeeded * item.quantity
          
          // Kurangi saldo tabel Ingredient
          await tx.ingredient.update({
            where: { id: r.ingredientId },
            data: { currentStock: { decrement: qtyToReduce } }
          })
          
          // Catat di StockMovement untuk Ingredient
          await tx.stockMovement.create({
            data: {
              businessId: business.id,
              ingredientId: r.ingredientId,
              type: "OUT",
              quantity: -qtyToReduce,
              referenceType: "SALE",
              referenceId: clientTransactionId
            }
          })
        }
      } 
      
      // Jika RETAIL: Kurangi stok produk jadi itu sendiri via StockMovement
      if (!p.hasBOM && p.trackInventory) {
        await tx.stockMovement.create({
          data: {
            businessId: business.id,
            productId: p.id,
            type: "OUT",
            quantity: -item.quantity,
            referenceType: "SALE",
            referenceId: clientTransactionId
          }
        })
      }
    }
  })
  
  await logAudit(business.id, "SALE_CREATED", "Sale", { clientTransactionId, totalAmount, items: cart.length })

  // 3. Analytics Tracking (Non-blocking)
  trackEvent(business.id, "pos_transaction_completed", { totalAmount, itemCount: cart.length, offline: false }).catch(() => {})

  revalidatePath("/")
  revalidatePath("/katalog")
  return { success: true }
  
  } catch (e: any) {
    console.error(e)
    logError("POS_CHECKOUT_ERROR", e.message, undefined, e.stack, "/kasir").catch(() => {})
    return { error: e.message }
  }
}
