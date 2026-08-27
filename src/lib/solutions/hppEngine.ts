export type UnitType = 'kg' | 'gram' | 'liter' | 'ml' | 'pcs' | 'bungkus' | 'sdm' | 'sdt' | 'lembar' | 'siung' | 'ikat' | 'botol';

export interface Ingredient {
  id: string;
  name: string;
  purchaseQuantity: number;
  purchaseUnit: UnitType | string;
  purchasePrice: number;
  usedQuantity: number;
  usedUnit: UnitType | string;
  calculatedCost?: number; // Diisi otomatis oleh engine
}

export interface RecipeData {
  productName: string;
  ingredients: Ingredient[];
  yieldQuantity: number;
  yieldUnit: string;
  totalCost?: number;
  costPerUnit?: number;
}

export interface LargestComponent {
  ingredient: Ingredient;
  percentage: number;
}

// Konversi satuan ke base unit (gram, ml, pcs)
function getBaseUnitValue(quantity: number, unit: string): { value: number; baseUnit: string } {
  const normalizedUnit = unit.toLowerCase().trim();
  
  // Massa
  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') {
    return { value: quantity * 1000, baseUnit: 'gram' };
  }
  if (normalizedUnit === 'gram' || normalizedUnit === 'g' || normalizedUnit === 'gr') {
    return { value: quantity, baseUnit: 'gram' };
  }
  
  // Volume
  if (normalizedUnit === 'liter' || normalizedUnit === 'l') {
    return { value: quantity * 1000, baseUnit: 'ml' };
  }
  if (normalizedUnit === 'ml' || normalizedUnit === 'mililiter') {
    return { value: quantity, baseUnit: 'ml' };
  }
  
  // Satuan Dapur Umum (estimasi kasar)
  if (normalizedUnit === 'sdm') {
    return { value: quantity * 15, baseUnit: 'gram' }; // Asumsi 1 sdm = 15g
  }
  if (normalizedUnit === 'sdt') {
    return { value: quantity * 5, baseUnit: 'gram' }; // Asumsi 1 sdt = 5g
  }
  
  // Jika tidak dapat dikonversi, kembalikan apa adanya (diasumsikan satuannya match)
  return { value: quantity, baseUnit: normalizedUnit };
}

export function calculateIngredientCost(ingredient: Ingredient): number {
  const purchase = getBaseUnitValue(ingredient.purchaseQuantity, ingredient.purchaseUnit);
  const used = getBaseUnitValue(ingredient.usedQuantity, ingredient.usedUnit);

  // Jika satuannya berbeda dan tidak bisa dikonversi (misal: 'ikat' vs 'gram'),
  // kita asumsikan perhitungan rasio langsung sebagai fallback,
  // tapi idealnya UI harus memaksa unit yang setara (massa ke massa).
  
  // Cegah division by zero
  if (purchase.value === 0) return 0;

  const cost = (used.value / purchase.value) * ingredient.purchasePrice;
  return cost;
}

export function calculateRecipe(recipe: RecipeData): RecipeData {
  let totalCost = 0;
  
  const updatedIngredients = recipe.ingredients.map(ing => {
    const cost = calculateIngredientCost(ing);
    totalCost += cost;
    return { ...ing, calculatedCost: cost };
  });

  const costPerUnit = recipe.yieldQuantity > 0 ? totalCost / recipe.yieldQuantity : totalCost;

  return {
    ...recipe,
    ingredients: updatedIngredients,
    totalCost,
    costPerUnit
  };
}

export function findLargestComponent(recipe: RecipeData): LargestComponent | null {
  if (!recipe.ingredients || recipe.ingredients.length === 0 || !recipe.totalCost) {
    return null;
  }

  let largest: Ingredient | null = null;
  let maxCost = -1;

  for (const ing of recipe.ingredients) {
    const cost = ing.calculatedCost || 0;
    if (cost > maxCost) {
      maxCost = cost;
      largest = ing;
    }
  }

  if (largest && recipe.totalCost > 0) {
    const percentage = (maxCost / recipe.totalCost) * 100;
    return {
      ingredient: largest,
      percentage: Math.round(percentage)
    };
  }

  return null;
}
