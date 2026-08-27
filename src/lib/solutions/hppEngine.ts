export type UnitType = 'kg' | 'gram' | 'liter' | 'ml' | 'pcs' | 'bungkus' | 'sdm' | 'sdt' | 'lembar' | 'siung' | 'ikat' | 'botol';

export type IngredientValidation =
  | 'valid'
  | 'missing_purchase_quantity'
  | 'missing_purchase_price'
  | 'missing_used_quantity'
  | 'incompatible_units'
  | 'unknown_unit';

export interface Ingredient {
  id: string;
  name: string;
  purchaseQuantity: number;
  purchaseUnit: UnitType | string;
  purchasePrice: number;
  usedQuantity: number;
  usedUnit: UnitType | string;
}

export interface CalculatedIngredient extends Ingredient {
  validationStatus: IngredientValidation;
  calculatedCost: number; // 0 if invalid
}

export interface RecipeData {
  productName: string;
  ingredients: Ingredient[];
  yieldQuantity: number;
  yieldUnit: string;
}

export interface CalculatedRecipeData extends RecipeData {
  ingredients: CalculatedIngredient[];
  totalCost: number;
  costPerUnit: number;
}

export interface LargestComponent {
  ingredientId: string;
  ingredientName: string;
  cost: number;
  percentage: number;
}

interface NormalizedUnit {
  value: number;
  baseUnit: 'gram' | 'ml' | 'pcs' | 'unknown';
}

// 1. Normalisasi ke canonical unit
export function normalizeUnit(quantity: number, unit: string): NormalizedUnit {
  const u = unit.toLowerCase().trim();
  
  // Massa -> gram
  if (u === 'kg' || u === 'kilogram') return { value: quantity * 1000, baseUnit: 'gram' };
  if (u === 'gram' || u === 'g' || u === 'gr') return { value: quantity, baseUnit: 'gram' };
  if (u === 'sdm') return { value: quantity * 15, baseUnit: 'gram' }; // Asumsi
  if (u === 'sdt') return { value: quantity * 5, baseUnit: 'gram' }; // Asumsi
  
  // Volume -> ml
  if (u === 'liter' || u === 'l') return { value: quantity * 1000, baseUnit: 'ml' };
  if (u === 'ml' || u === 'mililiter') return { value: quantity, baseUnit: 'ml' };
  
  // Count -> pcs
  if (u === 'pcs' || u === 'buah' || u === 'biji' || u === 'lembar' || u === 'siung' || u === 'ikat' || u === 'botol' || u === 'bungkus') {
    return { value: quantity, baseUnit: 'pcs' }; // Semuanya dihitung sebagai count
  }
  
  return { value: quantity, baseUnit: 'unknown' };
}

// 2. Validasi bahan
export function validateIngredient(ingredient: Ingredient): IngredientValidation {
  if (!ingredient.purchaseQuantity || ingredient.purchaseQuantity <= 0) return 'missing_purchase_quantity';
  if (ingredient.purchasePrice === undefined || ingredient.purchasePrice < 0) return 'missing_purchase_price';
  if (!ingredient.usedQuantity || ingredient.usedQuantity <= 0) return 'missing_used_quantity';

  const purchase = normalizeUnit(ingredient.purchaseQuantity, ingredient.purchaseUnit);
  const used = normalizeUnit(ingredient.usedQuantity, ingredient.usedUnit);

  if (purchase.baseUnit === 'unknown' || used.baseUnit === 'unknown') return 'unknown_unit';
  
  // Strict matching
  if (purchase.baseUnit !== used.baseUnit) {
    // Pengecualian khusus jika unit count spesifik digunakan (bungkus vs pcs) 
    // Tapi secara umum, 'pcs' adalah baseUnit universal untuk tipe hitungan.
    // Jika masih berbeda baseUnit (misal gram vs ml), maka incompat
    return 'incompatible_units';
  }

  return 'valid';
}

// 3. Menghitung cost 1 bahan
export function calculateIngredientCost(ingredient: Ingredient): number {
  const status = validateIngredient(ingredient);
  if (status !== 'valid') return 0;

  const purchase = normalizeUnit(ingredient.purchaseQuantity, ingredient.purchaseUnit);
  const used = normalizeUnit(ingredient.usedQuantity, ingredient.usedUnit);

  if (purchase.value === 0) return 0;
  return (used.value / purchase.value) * ingredient.purchasePrice;
}

export function calculateCostPerUnit(totalCost: number, yieldQuantity: number): number {
  if (yieldQuantity <= 0) return totalCost;
  return totalCost / yieldQuantity;
}

// 4. Menghitung seluruh resep
export function calculateRecipeCost(recipe: RecipeData): CalculatedRecipeData {
  let totalCost = 0;
  
  const calcIngredients: CalculatedIngredient[] = recipe.ingredients.map(ing => {
    const status = validateIngredient(ing);
    const cost = calculateIngredientCost(ing);
    if (status === 'valid') totalCost += cost;
    
    return {
      ...ing,
      validationStatus: status,
      calculatedCost: cost
    };
  });

  const costPerUnit = calculateCostPerUnit(totalCost, recipe.yieldQuantity);

  return {
    ...recipe,
    ingredients: calcIngredients,
    totalCost,
    costPerUnit
  };
}

export function calculateComponentPercentage(cost: number, totalCost: number): number {
  if (totalCost <= 0) return 0;
  return (cost / totalCost) * 100;
}

// 5. Mencari komponen terbesar
export function findLargestComponent(calcRecipe: CalculatedRecipeData): LargestComponent | null {
  if (!calcRecipe.ingredients || calcRecipe.ingredients.length === 0 || calcRecipe.totalCost <= 0) {
    return null;
  }

  let largest: CalculatedIngredient | null = null;
  let maxCost = -1;

  for (const ing of calcRecipe.ingredients) {
    if (ing.validationStatus === 'valid' && ing.calculatedCost > maxCost) {
      maxCost = ing.calculatedCost;
      largest = ing;
    }
  }

  if (largest) {
    return {
      ingredientId: largest.id,
      ingredientName: largest.name,
      cost: largest.calculatedCost,
      percentage: Math.round(calculateComponentPercentage(largest.calculatedCost, calcRecipe.totalCost) * 10) / 10 // 1 decimal point
    };
  }

  return null;
}
