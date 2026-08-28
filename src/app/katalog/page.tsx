import { formatNumber, formatRupiah } from '@/lib/format';
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import KatalogListClient from "./KatalogListClient"

function stockBadge(currentStock: number, minStock: number) {
  if (currentStock <= 0) return <Badge variant="danger">HABIS</Badge>
  if (currentStock <= minStock) return <Badge variant="warning">MENIPIS</Badge>
  return <Badge variant="success">TERSEDIA</Badge>
}

function marginBadge(margin: number) {
  if (margin >= 40) return <Badge variant="success">Margin {margin.toFixed(0)}%</Badge>
  if (margin >= 20) return <Badge variant="warning">Margin {margin.toFixed(0)}%</Badge>
  return <Badge variant="danger">Margin {margin.toFixed(0)}%</Badge>
}

export default async function KatalogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/")

  const isFnB = business.businessType === 'F_AND_B'

  const [products, ingredients] = await Promise.all([
    prisma.product.findMany({ where: { businessId: business.id, isActive: true } }),
    prisma.ingredient.findMany({ where: { businessId: business.id } })
  ])

  // Retail stock fetch
  const retailProducts = products.filter(p => !p.hasBOM && p.trackInventory)
  const productStocks: Record<string, number> = {}
  
  if (retailProducts.length > 0) {
    const movements = await prisma.stockMovement.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { businessId: business.id, productId: { in: retailProducts.map(p => p.id) } }
    })
    for (const m of movements) {
      if (m.productId) productStocks[m.productId] = m._sum.quantity || 0
    }
    for (const rp of retailProducts) {
      if (productStocks[rp.id] === undefined) productStocks[rp.id] = 0
    }
  }

  // Warnings
  const outOfStockIng = ingredients.filter(i => i.currentStock <= 0)
  const lowStockIng = ingredients.filter(i => i.currentStock > 0 && i.currentStock <= i.minStock)
  const outOfStockProd = retailProducts.filter(p => productStocks[p.id] <= 0)
  const lowStockProd = retailProducts.filter(p => productStocks[p.id] > 0 && productStocks[p.id] <= 5) // assume 5 is min for retail

  const hasWarnings = outOfStockIng.length > 0 || lowStockIng.length > 0 || outOfStockProd.length > 0 || lowStockProd.length > 0

  // Visibility logic
  const hasBomProducts = products.some(p => p.hasBOM)
  const showIngredientsSection = isFnB || hasBomProducts || ingredients.length > 0
  const ingredientsTitle = isFnB ? "Bahan Baku" : "Komponen / Material"

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-7xl mx-auto">
      {/* HEADER FLAT STANDAR */}
      <div className="bg-white px-4 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm font-semibold inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Beranda
          </Link>
          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Katalog & Stok</h1>
        </div>
      </div>

      <div className="px-4 lg:px-8 mt-6 space-y-6 md:space-y-8">

        {/* Peringatan Stok */}
        {hasWarnings && (
          <div className="bg-white border-t-4 border-warning-400 rounded-xl shadow-sm p-4 space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-warning-800 uppercase tracking-wider mb-3">Peringatan Stok Keseluruhan</p>
            </div>
            {outOfStockIng.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{i.name}</span>
                <Badge variant="danger">Habis</Badge>
              </div>
            ))}
            {lowStockIng.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{i.name} ({i.currentStock} {i.unit})</span>
                <Badge variant="warning">Menipis</Badge>
              </div>
            ))}
            {outOfStockProd.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{p.name}</span>
                <Badge variant="danger">Stok Habis</Badge>
              </div>
            ))}
            {lowStockProd.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{p.name} ({productStocks[p.id]} unit)</span>
                <Badge variant="warning">Menipis</Badge>
              </div>
            ))}
          </div>
        )}

        <KatalogListClient 
          ingredients={ingredients}
          products={products}
          productStocks={productStocks}
          showIngredientsSection={showIngredientsSection}
          ingredientsTitle={ingredientsTitle}
        />

      </div>

      {/* Spacer below before bottom nav */}
      <div className="h-8"></div>
    </div>
  )
}
