import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// --- IN-MEMORY CACHE & RATE LIMIT ---
const productCache = new Map<string, any>();
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_MAX = 20; // Ditingkatkan sedikit agar user bisa testing wajar
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

const getAiClient = () => {
  // Hanya berjalan di sisi server, tidak akan bocor ke client.
  const apiKey = process.env.Gemini_API_Key_Logaritma_Home || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  return new GoogleGenerativeAI(apiKey);
};

// --- VALIDATION HELPERS ---
function getUnitDimension(unit: string): string {
  const u = unit.toLowerCase().trim();
  if (['kg', 'gram', 'g', 'mg'].includes(u)) return 'mass';
  if (['liter', 'l', 'ml'].includes(u)) return 'volume';
  return 'count'; // pcs, bungkus, lembar, botol, siung, ikat, dll
}

function validateUnitCompatibility(purchaseUnit: string, usedUnit: string): boolean {
  return getUnitDimension(purchaseUnit) === getUnitDimension(usedUnit);
}

function validateAIOutput(data: any): { valid: boolean; error?: string } {
  if (!data.productName || !data.yield || !Array.isArray(data.ingredients)) {
    return { valid: false, error: 'Malformed output: missing required fields' };
  }

  if (typeof data.yield.quantity !== 'number' || data.yield.quantity <= 0) {
    return { valid: false, error: 'Malformed output: yield quantity must be > 0' };
  }

  const itemsToCheck = [
    ...(data.ingredients || []),
    ...(data.packaging || [])
  ];

  for (const item of itemsToCheck) {
    if (item.purchaseQuantity <= 0) return { valid: false, error: `Invalid purchaseQuantity for ${item.name}` };
    if (item.estimatedMarketPrice < 0) return { valid: false, error: `Invalid estimatedMarketPrice for ${item.name}` };
    if (item.usedQuantity < 0) return { valid: false, error: `Invalid usedQuantity for ${item.name}` };
    
    if (!validateUnitCompatibility(item.purchaseUnit, item.usedUnit)) {
      return { 
        valid: false, 
        error: `Incompatible units for ${item.name}: ${item.purchaseUnit} vs ${item.usedUnit}`
      };
    }

    if (item.category && !['Bahan Utama', 'Bumbu', 'Saus/Cuko', 'Pelengkap'].includes(item.category)) {
      return { valid: false, error: `Invalid category for ${item.name}: ${item.category}` };
    }
  }

  if (data.productionCosts) {
    for (const cost of data.productionCosts) {
      if (cost.estimatedCostPerBatch < 0) {
        return { valid: false, error: `Invalid estimatedCostPerBatch for ${cost.name}` };
      }
    }
  }

  return { valid: true };
}

export async function POST(req: Request) {
  try {
    // 1. RATE LIMITING
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    if (now > limitRecord.resetTime) {
      limitRecord.count = 0;
      limitRecord.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    if (limitRecord.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMIT", message: "Limit pencarian tercapai. Silakan coba lagi nanti." } },
        { status: 429 }
      );
    }
    
    limitRecord.count += 1;
    rateLimitMap.set(ip, limitRecord);

    // 2. PARSE REQUEST
    const body = await req.json();
    const { productName, imageBase64, clarifications } = body;

    if (!productName && !imageBase64) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Product name or image is required." } },
        { status: 400 }
      );
    }

    // 3. CACHE CHECK
    const cacheKeyObj = { productName, hasImage: !!imageBase64, clarifications };
    const cacheKey = crypto.createHash('md5').update(JSON.stringify(cacheKeyObj)).digest('hex');
    
    if (productCache.has(cacheKey)) {
      console.log(`[CACHE HIT] Mengembalikan draft resep: ${productName || 'Image'}`);
      return NextResponse.json(productCache.get(cacheKey));
    }

    console.log(`[CACHE MISS] Memanggil AI untuk: ${productName || 'Image'}`);

    // 4. GEMINI CLIENT (Menggunakan model terbukti gemini-3.5-flash)
    const ai = getAiClient();
    const model = ai.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // 5. PROMPT CONSTRUCTION
    const prompt = `Anda adalah RECIPE MAPPING ENGINE untuk bisnis F&B Indonesia.
Tugas Anda BUKAN menghitung HPP (Harga Pokok Penjualan).
Tugas Anda HANYA membuat DRAFT PEMETAAN:
- bahan yang kemungkinan digunakan
- jumlah penggunaan
- satuan pembelian
- satuan penggunaan
- estimasi harga pasar
- packaging
- production cost sederhana
- estimasi yield

SEMUA DATA ADALAH ESTIMASI. User akan memverifikasi dan mengoreksinya.
Jangan pernah menghasilkan field: actualPurchasePrice, calculatedCost, totalCost, costPerUnit, componentPercentage.

Aturan Kategori Bahan: 
Hanya gunakan salah satu dari: "Bahan Utama", "Bumbu", "Saus/Cuko", "Pelengkap".

Aturan Satuan (SANGAT KETAT):
Massa harus dengan massa (kg, gram).
Volume harus dengan volume (liter, ml).
Hitungan dengan hitungan (pcs, bungkus, lembar).
DILARANG KERAS mengkonversi massa/volume ke pcs. 
Jika telur dibeli per kg tapi dipakai per pcs, Anda HARUS menulisnya dibeli per pcs dan dipakai per pcs (contoh: 10 pcs harga Rp20000, pakai 1 pcs).

Packaging:
Harus sama formatnya dengan bahan (punya purchaseQuantity, purchaseUnit, estimatedMarketPrice, usedQuantity, usedUnit).

Production Cost:
Jangan dicampur ke bahan. Pisahkan, contoh: "Gas & Minyak" estimasi Rp8000 per batch.

Yield:
Estimasi hasil resep, TIDAK BOLEH hardcode 1 (isEstimated: true).

Konteks Produk:
Nama Produk: ${productName || 'Lihat foto'}
${clarifications ? `Klarifikasi User: ${JSON.stringify(clarifications)}` : ''}

Output HARUS mengikuti JSON schema v1 ini:
{
  "productName": "string",
  "confidence": "high" | "medium" | "low",
  "yield": { "quantity": number, "unit": "string", "isEstimated": true },
  "assumptions": ["string"],
  "ingredients": [
    {
      "id": "ing_...",
      "name": "string",
      "category": "Bahan Utama" | "Bumbu" | "Saus/Cuko" | "Pelengkap",
      "purchaseQuantity": number,
      "purchaseUnit": "string",
      "estimatedMarketPrice": number,
      "usedQuantity": number,
      "usedUnit": "string"
    }
  ],
  "packaging": [
    {
      "id": "pack_...",
      "name": "string",
      "purchaseQuantity": number,
      "purchaseUnit": "string",
      "estimatedMarketPrice": number,
      "usedQuantity": number,
      "usedUnit": "string"
    }
  ],
  "productionCosts": [
    {
      "id": "prod_...",
      "name": "string",
      "estimatedCostPerBatch": number
    }
  ]
}
`;

    const contentParts: any[] = [{ text: prompt }];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      });
    }

    // 6. API CALL (Maksimal 1 kali, tanpa retry)
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: contentParts }]
    });

    const responseText = response.response.text();
    let data;
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleanJson);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: { code: "PARSE_ERROR", message: "Gagal memproses respon dari AI." } },
        { status: 500 }
      );
    }

    // 7. SERVER VALIDATION
    const validation = validateAIOutput(data);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validation.error } },
        { status: 500 }
      );
    }

    // 8. SAVE CACHE & RESPOND
    productCache.set(cacheKey, data);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("HPP Analyze API Error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Terjadi kesalahan sistem." } },
      { status: 500 }
    );
  }
}
