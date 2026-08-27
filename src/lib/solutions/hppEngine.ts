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
  category?: string;
  purchaseQuantity: number;
  purchaseUnit: UnitType | string;
  actualPurchasePrice: number; // Harga aktual dari user
  estimatedMarketPrice?: number; // Estimasi AI (benchmark)
  usedQuantity: number;
  usedUnit: UnitType | string;
  isUserOverridden?: boolean;
}

export interface CalculatedIngredient extends Ingredient {
  validationStatus: IngredientValidation;
  calculatedCost: number; // 0 if invalid
}

export interface ProductionCost {
  id: string;
  name: string;
  estimatedCostPerBatch: number; // Langsung berupa cost batch
  actualCostPerBatch?: number; // Override user
  isUserOverridden?: boolean;
}

export interface CalculatedProductionCost extends ProductionCost {
  calculatedCost: number; // sama dengan actual / estimated
}

export interface RecipeData {
  productName: string;
  ingredients: Ingredient[];
  packaging: Ingredient[];
  productionCosts: ProductionCost[];
  yieldQuantity: number;
  yieldUnit: string;
  isYieldEstimated: boolean;
}

export interface CalculatedRecipeData extends RecipeData {
  ingredients: CalculatedIngredient[];
  packaging: CalculatedIngredient[];
  productionCosts: CalculatedProductionCost[];
  totalIngredientCost: number;
  totalPackagingCost: number;
  totalProductionCost: number;
  totalBatchCost: number;
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
  if (ingredient.actualPurchasePrice === undefined || ingredient.actualPurchasePrice < 0) return 'missing_purchase_price';
  if (!ingredient.usedQuantity || ingredient.usedQuantity <= 0) return 'missing_used_quantity';

  const purchase = normalizeUnit(ingredient.purchaseQuantity, ingredient.purchaseUnit);
  const used = normalizeUnit(ingredient.usedQuantity, ingredient.usedUnit);

  if (purchase.baseUnit === 'unknown' || used.baseUnit === 'unknown') return 'unknown_unit';
  
  if (purchase.baseUnit !== used.baseUnit) {
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
  return (used.value / purchase.value) * ingredient.actualPurchasePrice;
}

export function calculateCostPerUnit(totalBatchCost: number, yieldQuantity: number): number {
  if (yieldQuantity <= 0) return totalBatchCost;
  return totalBatchCost / yieldQuantity;
}

// 4. Menghitung seluruh resep
export function calculateRecipeCost(recipe: RecipeData): CalculatedRecipeData {
  let totalIngredientCost = 0;
  let totalPackagingCost = 0;
  let totalProductionCost = 0;
  
  const calcIngredients: CalculatedIngredient[] = recipe.ingredients.map(ing => {
    const status = validateIngredient(ing);
    const cost = calculateIngredientCost(ing);
    if (status === 'valid') totalIngredientCost += cost;
    
    return {
      ...ing,
      validationStatus: status,
      calculatedCost: cost
    };
  });

  const calcPackaging: CalculatedIngredient[] = recipe.packaging.map(pack => {
    const status = validateIngredient(pack);
    const cost = calculateIngredientCost(pack);
    if (status === 'valid') totalPackagingCost += cost;
    
    return {
      ...pack,
      validationStatus: status,
      calculatedCost: cost
    };
  });

  const calcProduction: CalculatedProductionCost[] = recipe.productionCosts.map(prod => {
    const cost = prod.isUserOverridden && prod.actualCostPerBatch !== undefined ? prod.actualCostPerBatch : prod.estimatedCostPerBatch;
    totalProductionCost += cost;
    return {
      ...prod,
      calculatedCost: cost
    };
  });

  const totalBatchCost = totalIngredientCost + totalPackagingCost + totalProductionCost;
  const costPerUnit = calculateCostPerUnit(totalBatchCost, recipe.yieldQuantity);

  return {
    ...recipe,
    ingredients: calcIngredients,
    packaging: calcPackaging,
    productionCosts: calcProduction,
    totalIngredientCost,
    totalPackagingCost,
    totalProductionCost,
    totalBatchCost,
    costPerUnit
  };
}

export function calculateComponentPercentage(cost: number, totalCost: number): number {
  if (totalCost <= 0) return 0;
  return (cost / totalCost) * 100;
}

// 5. Menghitung contributors
export interface Contributor {
  ingredientId: string;
  ingredientName: string;
  cost: number;
  percentage: number;
}

export function calculateContributors(calcRecipe: CalculatedRecipeData): Contributor[] {
  const allComponents = [...calcRecipe.ingredients, ...calcRecipe.packaging];
  if (allComponents.length === 0 || calcRecipe.totalBatchCost <= 0) return [];

  const validComponents = allComponents.filter(c => c.validationStatus === 'valid' && c.calculatedCost > 0);
  
  const contributors = validComponents.map(c => ({
    ingredientId: c.id,
    ingredientName: c.name,
    cost: c.calculatedCost,
    percentage: Math.round(calculateComponentPercentage(c.calculatedCost, calcRecipe.totalBatchCost) * 10) / 10
  }));

  return contributors.sort((a, b) => b.cost - a.cost);
}
