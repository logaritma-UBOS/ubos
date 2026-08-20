export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

function stockBadge(currentStock: number, minStock: number) {
  if (currentStock <= 0) return <Badge variant="danger">Habis</Badge>
  if (currentStock <= minStock) return <Badge variant="warning">Menipis</Badge>
  return <Badge variant="success">Tersedia</Badge>
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

  const products = await prisma.product.findMany({ where: { businessId: business.id } })
  const ingredients = await prisma.ingredient.findMany({ where: { businessId: business.id } })

  const outOfStock = ingredients.filter(i => i.currentStock <= 0)
  const lowStock = ingredients.filter(i => i.currentStock > 0 && i.currentStock <= i.minStock)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-primary-700 text-white p-4 pb-6 rounded-b-3xl">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white/80 text-sm font-medium hover:text-white transition-colors">← Beranda</Link>
          <h1 className="text-lg font-bold">Katalog</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-6">

        {/* Peringatan Stok — Ringkasan Kritis */}
        {(outOfStock.length > 0 || lowStock.length > 0) && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-warning-800 uppercase tracking-wider mb-2">Peringatan Stok</p>
            {outOfStock.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-800 font-medium">{i.name}</span>
                <Badge variant="danger">Habis</Badge>
              </div>
            ))}
            {lowStock.map(i => (
              <div key={i.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-800 font-medium">{i.name} ({i.currentStock} {i.unit})</span>
                <Badge variant="warning">Menipis</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Section: Bahan Baku */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bahan Baku</h2>
            <Link href="/katalog/bahan/tambah" className="text-primary-700 text-sm font-bold">+ Tambah</Link>
          </div>

          {ingredients.length === 0 ? (
            <p className="text-sm text-gray-400 italic p-3">Belum ada bahan baku.</p>
          ) : (
            <div className="space-y-2">
              {ingredients.map(ing => (
                <Card key={ing.id}>
                  <div className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{ing.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ing.currentStock} {ing.unit} tersedia · Rp {ing.costPerUnit.toLocaleString("id-ID")}/{ing.unit}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {stockBadge(ing.currentStock, ing.minStock)}
                      <div className="flex gap-3">
                        <Link
                          href={`/katalog/bahan/${ing.id}/edit`}
                          className="text-info-600 text-xs font-bold min-h-[32px] flex items-center px-1"
                        >
                          Edit
                        </Link>
                        <form action={async () => {
                          "use server"
                          try { await prisma.ingredient.delete({ where: { id: ing.id } }) } catch (e) {}
                          revalidatePath("/katalog")
                        }}>
                          <button type="submit" className="text-danger-600 text-xs font-bold min-h-[32px] flex items-center px-1">
                            Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section: Produk Jualan */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Produk Jualan</h2>
            <Link href="/katalog/produk/tambah" className="text-primary-700 text-sm font-bold">+ Tambah</Link>
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-gray-400 italic p-3">Belum ada produk.</p>
          ) : (
            <div className="space-y-2">
              {products.map(prod => (
                <Card key={prod.id}>
                  <div className="p-3 flex items-center gap-3">
                    <Link href={`/katalog/produk/${prod.id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{prod.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Jual Rp {prod.sellPrice.toLocaleString("id-ID")} · HPP Rp {prod.calculatedHpp.toLocaleString("id-ID")}
                      </p>
                    </Link>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {marginBadge(prod.calculatedMargin)}
                      <div className="flex gap-3">
                        <Link
                          href={`/katalog/produk/${prod.id}/edit`}
                          className="text-info-600 text-xs font-bold min-h-[32px] flex items-center px-1"
                        >
                          Edit
                        </Link>
                        <form action={async () => {
                          "use server"
                          try { await prisma.product.delete({ where: { id: prod.id } }) } catch (e) {}
                          revalidatePath("/katalog")
                        }}>
                          <button type="submit" className="text-danger-600 text-xs font-bold min-h-[32px] flex items-center px-1">
                            Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
