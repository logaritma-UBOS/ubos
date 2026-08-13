export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, contextData } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKeyUbos = process.env.API_KEY_UBOS_RITEL;
    const apiKeyFallback = process.env.GEMINI_API_KEY;
    const apiKey = apiKeyUbos || apiKeyFallback;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const merchantProfile = contextData?.merchantProfile || {};
    
    const systemInstruction = `Anda adalah AI Business Copilot khusus bisnis Ritel & Minimarket di Logaritma UBOS. Tugas Anda menganalisis omset penjualan harian, pergerakan stok barang, margin laba (kulakan vs harga jual), serta memberikan rekomendasi aksi praktis, cepat, dan berorientasi pada peningkatan profit serta efisiensi perputaran stok.

PROFIL USAHA USER SAAT INI:
- Nama Usaha: ${merchantProfile.nama_usaha || 'Toko Ritel & Minimarket UBOS'}
- Jenis Usaha: ${merchantProfile.kategori_usaha || 'Ritel & Minimarket'}
- Jam Operasional: ${merchantProfile.operating_hours || 'Belum diatur'}

ATURAN REKOMENDASI:
1. Pahami jam operasional user dan jenis usahanya (toko kelontong, minimarket, grosir, dll).
2. Berikan rekomendasi spesifik ke ritel, seperti strategi promo bundling barang, penataan rak (visual merchandising), manajemen stok (FIFO/LIFO), dan pengingat restock barang kritis.
3. Bantu memisahkan mindset modal belanja (kulakan) dan profit bersih.
4. Gunakan bahasa Indonesia sehari-hari yang santai, ringkas, dan langsung ke solusi.
5. Jawab dengan ringkas dan to the point, maksimal 3-4 kalimat. Pastikan setiap kalimat selesai dengan sempurna dan tidak terputus.

Data Konteks Halaman: ${JSON.stringify(contextData?.insights || [])}`;

    let responseText = "";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });
      const result = await model.generateContent(message);
      responseText = result.response.text();
    } catch (e: any) {
      if (apiKeyUbos && apiKey === apiKeyUbos && apiKeyFallback) {
        console.warn('API Key UBOS Ritel gagal, fallback ke GEMINI_API_KEY...');
        const genAIFallback = new GoogleGenerativeAI(apiKeyFallback);
        const modelFallback = genAIFallback.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction
        });
        const result = await modelFallback.generateContent(message);
        responseText = result.response.text();
      } else {
        throw e;
      }
    }

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
