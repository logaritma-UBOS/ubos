import assert from 'node:assert'
import { generateInventoryContext, RecipeInput } from '../src/lib/engines/inventoryContextEngine.js'

function runTests() {
  console.log("Running Inventory Context Engine Tests...")

  const productA = "PROD_A"
  const productB = "PROD_B" // untracked

  const recipes: RecipeInput[] = [
    {
      productId: productA,
      quantityNeeded: 2,
      ingredient: { id: "ING_1", name: "Susu", currentStock: 10, minStock: 5 } // produces 5
    },
    {
      productId: productA,
      quantityNeeded: 1,
      ingredient: { id: "ING_2", name: "Kopi", currentStock: 2, minStock: 3 } // produces 2, Low Stock (2 <= 3)
    }
  ]

  const context = generateInventoryContext([productA, productB], recipes)

  // Test Product A (Tracked)
  const a = context[productA]
  assert.strictEqual(a.hasRecipe, true, "Product A has recipe")
  assert.strictEqual(a.stockAvailable, 2, "Product A max produces 2 (bottleneck Kopi)")
  assert.strictEqual(a.isOutOfStock, false, "Product A is not OOS")
  assert.strictEqual(a.isLowStock, true, "Product A is Low Stock because Kopi < minStock")
  assert.strictEqual(a.limitingIngredientName, "Kopi", "Bottleneck is Kopi")

  // Test Product B (Untracked)
  const b = context[productB]
  assert.strictEqual(b.hasRecipe, false, "Product B untracked")
  assert.strictEqual(b.stockAvailable, null, "Product B stock is null")
  assert.strictEqual(b.isOutOfStock, false, "Untracked product is never OOS")
  assert.strictEqual(b.isLowStock, false, "Untracked product is never Low Stock")

  // Test OOS
  const productC = "PROD_C"
  const recipesC: RecipeInput[] = [
    {
      productId: productC,
      quantityNeeded: 1,
      ingredient: { id: "ING_3", name: "Gula", currentStock: 0, minStock: 5 } 
    }
  ]
  const contextC = generateInventoryContext([productC], recipesC)
  const c = contextC[productC]
  assert.strictEqual(c.stockAvailable, 0, "Product C stock is 0")
  assert.strictEqual(c.isOutOfStock, true, "Product C is OOS")
  assert.strictEqual(c.isLowStock, true, "Product C is Low Stock")

  console.log("✅ INVENTORY CONTEXT ENGINE TESTS PASS")
}

runTests()
