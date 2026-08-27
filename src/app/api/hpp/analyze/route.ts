import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting for MVP
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_MAX = 10; // Max 10 analysis per IP
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

const getAiClient = () => {
  const apiKey = process.env.Gemini_API_Key_Logaritma_Home || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(req: Request) {
  try {
    // 1. Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const limitRecord = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    
    if (now > limitRecord.resetTime) {
      limitRecord.count = 0;
      limitRecord.resetTime = now + RATE_LIMIT_WINDOW;
    }
    
    if (limitRecord.count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    limitRecord.count += 1;
    rateLimitMap.set(ip, limitRecord);

    // 2. Parse Request
    const body = await req.json();
    const { productName, imageBase64 } = body;

    if (!productName && !imageBase64) {
      return NextResponse.json(
        { success: false, error: 'Product name or image is required.' },
        { status: 400 }
      );
    }

    const ai = getAiClient();
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // 3. Prompt Construction
    const prompt = `Anda adalah ahli kuliner dan F&B Indonesia. Analisis produk berikut dan buat DRAFT resep komprehensif.

Konteks: Produk F&B Indonesia.
Aturan:
1. Jangan hanya mencantumkan bahan utama. Masukkan bahan pendukung, bumbu, saus, minyak, pelengkap, dll.
2. Jangan mengarang bahan yang tidak lazim.
3. Estimasi harga pasar (estimatedMarketPrice) harus realistis dalam Rupiah (IDR) berdasarkan harga di Indonesia saat ini.
4. Gunakan satuan baku: kg, gram, liter, ml, pcs, bungkus, sdm, sdt, siung, lembar.

Jika menerima FOTO: Kenali produk dari foto dan buat draft resep berdasarkan produk yang teridentifikasi (bukan membaca resep persis dari foto).
Jika menerima NAMA: Buat draft resep standar untuk produk tersebut.

Informasi Produk:
Nama Produk: ${productName || 'Lihat foto'}

Output HARUS berupa JSON valid dengan skema berikut (tanpa markdown, hanya raw JSON):
{
  "productName": "Nama lengkap produk yang diidentifikasi",
  "confidence": "high" | "medium" | "low",
  "ingredients": [
    {
      "id": "string unik pendek",
      "name": "nama bahan",
      "purchaseQuantity": angka,
      "purchaseUnit": "satuan beli",
      "estimatedMarketPrice": angka dalam IDR,
      "usedQuantity": angka,
      "usedUnit": "satuan pakai",
      "role": "main" | "supporting" | "seasoning" | "sauce" | "oil" | "garnish"
    }
  ],
  "yieldQuantity": angka porsi/pcs yang dihasilkan,
  "yieldUnit": "pcs" atau "porsi",
  "assumptions": ["asumsi 1", "asumsi 2"]
}
`;

    // 4. API Call
    let responseText = "";
    
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };
      
      const result = await model.generateContent([prompt, imagePart]);
      responseText = result.response.text();
    } else {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    }

    // 5. JSON Parsing (No Retry)
    try {
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const draft = JSON.parse(cleanedText);
      
      return NextResponse.json({
        success: true,
        draft
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        { success: false, error: 'AI menghasilkan format yang tidak valid. Silakan coba lagi.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("HPP Analyze API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
