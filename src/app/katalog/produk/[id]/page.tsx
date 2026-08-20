export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { addRecipeItem } from "@/actions/catalog"
import { updateProductHpp } from "@/lib/engines/hppEngine"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  
  const id = (await params).id
  
  const product = await prisma.product.findUnique({
    where: { id: id },
    include: { recipes: { include: { ingredient: true } } }
  })
  
  if (!product) redirect("/katalog")

  const ingredients = await prisma.ingredient.findMany({ where: { businessId: product.businessId } })

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <Link href="/katalog" className="text-sm font-semibold text-gray-600">← Kembali</Link>
        <h1 className="font-bold text-gray-900">Detail Produk</h1>
        <div className="w-16"></div>
      </div>
      
      <div className="p-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <div className="flex justify-between mt-4">
            <div>
              <p className="text-xs text-gray-500">Harga Jual</p>
              <p className="text-lg font-bold text-green-700">Rp {product.sellPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">HPP / Modal</p>
              <p className="text-lg font-bold text-orange-600">Rp {product.calculatedHpp}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">Keuntungan kotor: <span className="font-bold text-gray-900">Rp {product.sellPrice - product.calculatedHpp}</span></p>
            <p className="text-sm text-gray-600">Margin: <span className="font-bold text-green-600">{product.calculatedMargin.toFixed(0)}%</span></p>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-3">Resep & Bahan (HPP)</h3>
        <div className="space-y-2 mb-6">
          {product.recipes.map(recipe => (
            <div key={recipe.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">{recipe.ingredient.name}</p>
                <p className="text-xs text-gray-500">{recipe.quantityNeeded} {recipe.ingredient.unit} x Rp {recipe.ingredient.costPerUnit}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="font-semibold text-gray-900">Rp {recipe.quantityNeeded * recipe.ingredient.costPerUnit}</p>
                <form action={async () => {
                  "use server"
                  try {
                    await prisma.recipe.delete({ where: { id: recipe.id } })
                    await updateProductHpp(product.id)
                  } catch (e) {
                    console.log("Already deleted or error", e)
                  }
                  revalidatePath(`/katalog/produk/${product.id}`)
                }}>
                  <button type="submit" className="text-red-500 text-xs font-bold p-1">Hapus</button>
                </form>
              </div>
            </div>
          ))}
          {product.recipes.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada resep. Tambahkan bahan untuk menghitung HPP otomatis.</p>}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3 text-sm">Tambah Bahan ke Resep</h4>
          <form action={async (formData) => {
            "use server"
            await addRecipeItem(formData)
          }} className="space-y-3">
            <input type="hidden" name="productId" value={product.id} />
            <select name="ingredientId" className="w-full border border-gray-300 p-2 rounded text-gray-900 text-sm">
              <option value="">-- Pilih Bahan Baku --</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name} (Rp {ing.costPerUnit}/{ing.unit})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" name="quantityNeeded" step="0.01" placeholder="Jumlah dipakai" className="w-full border border-gray-300 p-2 rounded text-gray-900 text-sm" />
              <button type="submit" className="bg-green-600 text-white font-bold px-4 rounded text-sm whitespace-nowrap">Tambah</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
