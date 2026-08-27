import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// 1. SIMPLE IN-MEMORY CACHE
const productCache = new Map();

// Initialize Gemini SDK
// It will automatically pick up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { productName, image, clarifications } = await req.json();
    const cacheKey = image ? "image_" + Date.now() : productName.toLowerCase().trim();

    // 2. CEK CACHE SEBELUM MEMANGGIL AI
    if (productCache.has(cacheKey)) {
      console.log(`[CACHE HIT] Mengambil data dari cache untuk: ${productName}`);
      const cachedData = productCache.get(cacheKey);
      
      // Jika butuh filter klarifikasi, terapkan di sini
      const filteredCategories = filterCategoriesByClarification(cachedData.categories, clarifications);
      
      return NextResponse.json({
        ...cachedData,
        categories: filteredCategories
      });
    }

    console.log(`[CACHE MISS] Memanggil AI (Gemini 2.5 Flash Lite) untuk: ${productName}`);

    // 3. PEMANGGILAN GEMINI (1 CALL STRUCTURED JSON)
    const prompt = `
Kamu adalah konsultan F&B dan ahli HPP (Harga Pokok Penjualan). 
Tugasmu adalah memecah produk makanan/minuman yang di-request menjadi resep dan bahan baku lengkap untuk 1 PORSI.
Nama Produk: "${productName || 'Identifikasi dari gambar ini'}"

Berikan respons HANYA dalam format JSON persis seperti struktur berikut tanpa tambahan teks apapun.

Struktur JSON yang WAJIB digunakan:
{
  "productName": "Nama Lengkap Produk",
  "categories": [
    {
      "id": "cat_1",
      "name": "Nama Kategori (misal: Komponen Utama, Bumbu, Pelengkap, Packaging)",
      "items": [
        {
          "id": "i_1",
          "name": "Nama Bahan",
          "qty": 100,
          "unit": "gr",
          "refPrice": 20000,
          "buyUnit": "kg",
          "convRatio": 1000,
          "myPrice": 20000
        }
      ]
    }
  ]
}

ATURAN PENTING:
1. "qty" adalah kuantitas (angka) yang dibutuhkan untuk membuat 1 PORSI produk tersebut.
2. "unit" adalah satuan takaran (gr, ml, pcs, lbr).
3. "buyUnit" adalah satuan belanja di pasar (kg, L, pack, pcs, btg).
4. "convRatio" adalah faktor pembagi dari buyUnit ke unit.
   - Jika unit = 'gr' dan buyUnit = 'kg', convRatio = 1000.
   - Jika unit = 'ml' dan buyUnit = 'L', convRatio = 1000.
   - Jika unit = 'pcs' dan buyUnit = 'pcs', convRatio = 1.
5. "refPrice" adalah estimasi wajar harga beli bahan tersebut di Indonesia dalam skala "buyUnit".
6. "myPrice" diisi SAMA PERSIS dengan "refPrice".
7. Selalu tambahkan kategori "Packaging" (misal: Box/Kertas Nasi, Sendok Plastik, dsb).
8. Selalu kembalikan pure JSON, jangan bungkus dengan markdown \`\`\`json.
`;

    let contentParts: any[] = [prompt];
    
    if (image) {
      const base64Data = image.split(',')[1];
      const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
      contentParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        prompt
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: contentParts,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let generatedDraft;
    try {
      // Remove any possible markdown wrapping if AI still output it
      let rawText = response.text || '';
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedDraft = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Gagal parse JSON dari Gemini:", response.text);
      throw new Error("Format AI tidak valid.");
    }

    // Tambahkan productionCosts default secara sistem, tidak perlu dari AI untuk menghemat output token
    generatedDraft.productionCosts = [
      { id: "p_1", name: "Gas", costPerPortion: 500, myCost: 500 },
      { id: "p_2", name: "Listrik", costPerPortion: 150, myCost: 150 },
      { id: "p_3", name: "Air", costPerPortion: 100, myCost: 100 },
      { id: "p_4", name: "Minyak Goreng", costPerPortion: 800, myCost: 800 },
    ];

    // Beri penanda ID yang unik jika AI menggunakan ID yang berulang
    let itemCounter = 1;
    generatedDraft.categories.forEach((cat: any, catIndex: number) => {
      cat.id = `cat_${catIndex + 1}`;
      cat.items.forEach((item: any) => {
        item.id = `i_${itemCounter++}`;
        // Ensure myPrice matches refPrice just in case
        item.myPrice = item.refPrice;
      });
    });

    // 4. SIMPAN KE CACHE
    productCache.set(cacheKey, generatedDraft);

    // 5. FILTER BERDASARKAN KLARIFIKASI SEBELUM DIKIRIM KE FRONTEND
    const filteredCategories = filterCategoriesByClarification(generatedDraft.categories, clarifications);

    return NextResponse.json({
      ...generatedDraft,
      categories: filteredCategories
    });

  } catch (error) {
    console.error("Error AI Recipe:", error);
    return NextResponse.json({ error: "Gagal memproses AI" }, { status: 500 });
  }
}

// --- HELPER LOGIC ---

function filterCategoriesByClarification(categories: any[], clarifications: any) {
  let filtered = [...categories];
  
  // Karena Gemini mengembalikan kategori yang dinamis, kita lakukan filter sederhana
  // berdasarkan nama kategori atau bahan yang mengandung kata tertentu.
  // Untuk MVP, filter ini bersifat best-effort.
  
  if (clarifications?.ayam === false) {
    filtered = filtered.filter(c => !c.name.toLowerCase().includes('ayam'));
  }
  
  if (clarifications?.sambal === false || clarifications?.lalapan === false) {
    filtered.forEach(cat => {
      cat.items = cat.items.filter((item: any) => {
        const name = item.name.toLowerCase();
        if (name.includes('sambal') && clarifications?.sambal === false) return false;
        if (name.includes('cabai') && clarifications?.sambal === false) return false;
        if (name.includes('timun') && clarifications?.lalapan === false) return false;
        if (name.includes('selada') && clarifications?.lalapan === false) return false;
        return true;
      });
    });
    // Bersihkan kategori kosong
    filtered = filtered.filter(cat => cat.items.length > 0);
  }
  
  return filtered;
}
