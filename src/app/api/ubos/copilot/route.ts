export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getMerchantApiKey(category: string): string {
  switch (category.toLowerCase()) {
    case 'kuliner':
      return process.env.GEMINI_API_KEY_MERCHANT_KULINER || process.env.GEMINI_API_KEY || '';
    case 'percetakan':
      return process.env.GEMINI_API_KEY_MERCHANT_PRINTING || process.env.GEMINI_API_KEY || '';
    case 'ritel':
      return process.env.GEMINI_API_KEY_MERCHANT_RETAIL || process.env.GEMINI_API_KEY || '';
    case 'jasa':
      return process.env.GEMINI_API_KEY_MERCHANT_SERVICE || process.env.GEMINI_API_KEY || '';
    default:
      return process.env.GEMINI_API_KEY || '';
  }
}

function getSystemInstruction(category: string, merchantProfile: any, contextData: any): string {
  const cat = category.toLowerCase();
  let basePrompt = `Anda adalah AI Business Copilot ahli untuk merchant Logaritma UBOS.
Anda WAJIB menggunakan metode "Backward Mapping": 
1. Tentukan Goal/Profit Akhir yang ideal untuk merchant ini.
2. Tarik mundur (backward) menjadi aksi operasional praktis hari ini.
3. Jangan bertele-tele, gunakan bahasa Indonesia kasual yang ramah kasir. Jawab dengan to-the-point maksimal 3-4 kalimat ringkas.

PROFIL USAHA SAAT INI:
- Nama Usaha: ${merchantProfile?.nama_usaha || 'Merchant UBOS'}
- Kategori URL: ${category}
- Jam Operasional: ${merchantProfile?.operating_hours || 'Belum diatur'}

FOKUS SPESIFIK:
`;

  if (cat === 'kuliner') {
    basePrompt += `- Fokus porsi harian, kontrol HPP resep (hindari over-portioning), pastikan margin aman walau dipotong komisi aplikasi delivery (Grab/Gojek/ShopeeFood), dan berikan peringatan dini bahan baku yang akan segera basi/expired.\n`;
  } else if (cat === 'percetakan') {
    basePrompt += `- Fokus target penjualan meter persegi (m²), efisiensi sisa pemotongan bahan roll, kelola antrean SPK (Surat Perintah Kerja) dengan tenggat waktu, dan kejar pelunasan DP pelanggan.\n`;
  } else if (cat === 'ritel') {
    basePrompt += `- Fokus pada target ukuran keranjang belanja (basket size), percepat putaran stok dengan mendeteksi dead-stock >30 hari, dan berikan ide strategi bundling produk di area kasir (impulse buy).\n`;
  } else if (cat === 'jasa') {
    basePrompt += `- Fokus pada utilisasi jam kerja harian teknisi/staf, minimalkan waktu menganggur (idle time), dan jadwalkan pesan pengingat WA otomatis untuk langganan atau repeat order.\n`;
  } else {
    basePrompt += `- Fokus pada peningkatan laba bersih harian, efisiensi modal belanja, dan promosi pintar.\n`;
  }

  basePrompt += `\nData Konteks Halaman Saat Ini (Wawasan Sistem): ${JSON.stringify(contextData?.insights || [])}`;
  return basePrompt;
}

export async function POST(req: NextRequest) {
  try {
    const { message, contextData, category } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const cat = category || 'general';
    const apiKey = getMerchantApiKey(cat);

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const systemInstruction = getSystemInstruction(cat, contextData?.merchantProfile, contextData);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    const result = await model.generateContent(message);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Gemini API Error Detail:', error?.message || error);
    const msg = error?.message || '';
    const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
    
    if (isQuotaError) {
       return NextResponse.json({
         error: 'Kuota API Gemini Anda telah habis (Error 429). Silakan gunakan kunci API baru atau upgrade akun Google AI Studio Anda.'
       }, { status: 429 });
    }
    
    return NextResponse.json({
      error: 'Maaf, AI sedang tidak bisa menjawab saat ini. Coba lagi nanti.'
    }, { status: 500 });
  }
}
