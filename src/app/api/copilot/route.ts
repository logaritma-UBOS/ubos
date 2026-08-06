import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { message, contextData } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const merchantProfile = contextData?.merchantProfile || {};
    
    const systemInstruction = `Kamu adalah AI Logaritma Copilot, asisten bisnis F&B pintar dari UBOS.
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

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 800,
      }
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error Detail:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Gagal terhubung ke Gemini API' }, { status: 500 });
  }
}
