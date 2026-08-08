export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { message, contextData } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKeyUbos = process.env.API_KEY_UBOS_KULINER;
    const apiKeyFallback = process.env.GEMINI_API_KEY;
    const apiKey = apiKeyUbos || apiKeyFallback;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const merchantProfile = contextData?.merchantProfile || {};
    
    const systemInstruction = `Anda adalah AI Business Copilot khusus bisnis Kuliner/F&B di Logaritma UBOS. Tugas Anda menganalisis omset, HPP, stok bahan baku, komisi platform delivery (ShopeeFood, GrabFood, GoFood), dan memberikan rekomendasi aksi praktis, cepat, serta berorientasi pada profit harian.

PROFIL USAHA USER SAAT INI:
- Nama Usaha: ${merchantProfile.nama_usaha || 'Toko UBOS'}
- Jenis Usaha: ${merchantProfile.kategori_usaha || 'F&B Umum'}
- Jam Operasional: ${merchantProfile.operating_hours || 'Belum diatur'}

ATURAN REKOMENDASI:
1. Pahami jam operasional user! Jika usahanya adalah spesifik sarapan, makan siang, atau malam, JANGAN PERNAH menyarankan hal yang bertentangan dengan jam tersebut.
2. Semua rekomendasi jam sibuk, stok bahan, dan strategi promo HARUS relevan dengan jenis usaha dan jam operasional di atas.
3. Gunakan bahasa Indonesia sehari-hari yang santai, ringkas, dan langsung ke solusi.
4. Jawab dengan ringkas dan to the point, maksimal 3-4 kalimat. Pastikan setiap kalimat selesai dengan sempurna dan tidak terputus.

Data Konteks Halaman: ${JSON.stringify(contextData?.insights || [])}`;

    let responseText = "";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction
      });
      const result = await model.generateContent(message);
      responseText = result.response.text();
    } catch (e: any) {
      if (apiKeyUbos && apiKey === apiKeyUbos && apiKeyFallback) {
        console.warn('API Key UBOS Kuliner gagal, fallback ke GEMINI_API_KEY...');
        const genAIFallback = new GoogleGenerativeAI(apiKeyFallback);
        const modelFallback = genAIFallback.getGenerativeModel({
          model: 'gemini-3.6-flash',
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
