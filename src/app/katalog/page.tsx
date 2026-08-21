export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

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

  const products = await prisma.product.findMany({ where: { businessId: business.id, isActive: true } })
  const ingredients = await prisma.ingredient.findMany({ where: { businessId: business.id } })

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
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 pb-6 rounded-b-3xl md:rounded-b-[48px] shadow-md">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white/80 text-sm font-medium hover:text-white transition-colors">&larr; Beranda</Link>
          <h1 className="text-lg md:text-xl font-bold">Katalog</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-6 md:space-y-8">

        {/* Peringatan Stok */}
        {hasWarnings && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            <div className="md:col-span-2">
              <p className="text-xs font-bold text-warning-800 uppercase tracking-wider mb-2">Peringatan Stok</p>
            </div>
            {outOfStockIng.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-warning-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{i.name}</span>
                <Badge variant="danger">Habis</Badge>
              </div>
            ))}
            {lowStockIng.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-warning-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{i.name} ({i.currentStock} {i.unit})</span>
                <Badge variant="warning">Menipis</Badge>
              </div>
            ))}
            {outOfStockProd.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-warning-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{p.name}</span>
                <Badge variant="danger">Stok Habis</Badge>
              </div>
            ))}
            {lowStockProd.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-warning-100 shadow-sm">
                <span className="text-gray-800 font-medium truncate pr-2">{p.name} ({productStocks[p.id]} unit)</span>
                <Badge variant="warning">Menipis</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Section: Bahan / Material */}
        {showIngredientsSection && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider">{ingredientsTitle}</h2>
              <Link href="/katalog/bahan/tambah" className="text-primary-700 text-sm md:text-base font-bold">+ Tambah</Link>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-gray-400 italic p-3 bg-white rounded-xl border border-dashed border-gray-200">Belum ada {ingredientsTitle.toLowerCase()}.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {ingredients.map(ing => {
                  const stockDisplay = ing.trackInventory 
                    ? `${ing.currentStock} ${ing.unit} tersedia` 
                    : `Tidak dilacak`
                  
                  return (
                    <Card key={ing.id} className="h-full">
                      <div className="p-3 md:p-4 flex flex-col justify-between h-full">
                        <Link href={`/katalog/bahan/${ing.id}/edit`} className="block min-w-0 mb-2">
                          <p className="font-bold text-gray-900 text-sm md:text-base truncate">{ing.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {stockDisplay} &middot; Rp {ing.costPerUnit.toLocaleString("id-ID")}/{ing.unit}
                          </p>
                        </Link>
                        <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-2">
                          <Badge variant={ing.trackInventory && ing.currentStock <= 0 ? "danger" : ing.trackInventory && ing.currentStock <= ing.minStock ? "warning" : "success"}>
                            {ing.trackInventory && ing.currentStock <= 0 ? "HABIS" : ing.trackInventory && ing.currentStock <= ing.minStock ? "MENIPIS" : "TERSEDIA"}
                          </Badge>
                          <div className="flex gap-3">
                            <Link href={`/katalog/bahan/${ing.id}/edit`} className="text-primary-600 text-xs font-bold hover:underline">Edit</Link>
                            <form action={async () => {
                              "use server"
                              try { await prisma.ingredient.delete({ where: { id: ing.id } }) } catch(e) {}
                              revalidatePath("/katalog")
                            }}>
                              <button type="submit" className="text-danger-600 text-xs font-bold hover:underline">Hapus</button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Section: Produk Jualan */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-wider">Produk Jualan</h2>
            <Link href="/katalog/produk/tambah" className="text-primary-700 text-sm md:text-base font-bold">+ Tambah</Link>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-gray-400 italic p-3 bg-white rounded-xl border border-dashed border-gray-200">Belum ada produk.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {products.map(prod => {
                const isRetail = !prod.hasBOM && prod.trackInventory;
                const isService = !prod.hasBOM && !prod.trackInventory;
                const isBom = prod.hasBOM;
                return (
                  <Card key={prod.id} className="h-full">
                    <div className="p-3 md:p-4 flex flex-col justify-between h-full">
                      <Link href={`/katalog/produk/${prod.id}`} className="flex gap-3 items-start mb-2 group">
                        {prod.imageUrl ? (
                          <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
                            <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover rounded-lg border border-gray-100 group-hover:opacity-90 transition-opacity" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-50 text-gray-300">
                            📷
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm md:text-base truncate group-hover:text-primary-700 transition-colors">{prod.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                            Jual Rp {prod.sellPrice.toLocaleString("id-ID")}
                            {isRetail && ` · Modal Rp ${prod.calculatedHpp.toLocaleString("id-ID")} · Stok: ${productStocks[prod.id]}`}
                            {isService && ` · Jasa Murni`}
                            {isBom && ` · HPP Rp ${prod.calculatedHpp.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                      </Link>
                      <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-2">
                        <Badge variant="warning">
                          MARGIN {prod.sellPrice > 0 ? Math.round(((prod.sellPrice - prod.calculatedHpp) / prod.sellPrice) * 100) : 0}%
                        </Badge>
                        <div className="flex gap-3">
                          <Link href={isBom ? `/katalog/produk/${prod.id}` : `/katalog/produk/${prod.id}/edit`} className="text-primary-600 text-xs font-bold hover:underline">
                            Edit
                          </Link>
                          <form action={async () => {
                            "use server"
                            try { await prisma.product.update({ where: { id: prod.id }, data: { isActive: false } }) } catch (e) {}
                            revalidatePath("/katalog")
                          }}>
                            <button type="submit" className="text-danger-600 text-xs font-bold hover:underline">Hapus</button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Spacer below before bottom nav */}
      <div className="h-8"></div>
    </div>
  )
}
