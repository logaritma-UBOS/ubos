export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topik/Penawaran is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `Anda adalah seorang ahli copywriting sekaliber Dewa Eka Prayoga.
Tugas Anda adalah membuat pesan WhatsApp untuk keperluan prospecting atau follow-up kepada calon klien/merchant.

Karakteristik Copywriting Dewa Eka Prayoga:
- Headline (kalimat pertama) yang memancing rasa penasaran atau menyentuh 'pain point' tajam.
- Bahasa santai tapi sopan (gunakan sapaan Kak / Bapak / Ibu).
- Susunan kalimat pendek-pendek (tidak bertele-tele).
- Ada penawaran yang bernilai tinggi (irresistible offer) atau edukasi halus.
- Call to Action (CTA) di akhir yang jelas dan mendorong urgensi.
- WAJIB menyertakan variabel {nama_usaha} di awal atau tengah pesan agar bisa di-replace secara dinamis oleh sistem.

DILARANG membuat pesan yang terlalu panjang (maksimal 3-4 paragraf pendek).
Output HANYA berupa teks pesan WhatsApp, jangan ada penjelasan tambahan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Buatkan pesan WhatsApp tentang: ${topic}`,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 600,
        temperature: 0.8
      }
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('Copywriting Generate Error:', error?.message || error);
    const msg = error?.message || '';
    const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
    return NextResponse.json({
      error: isQuotaError
        ? 'Kuota AI hari ini sudah habis. Coba lagi besok.'
        : (msg || 'Gagal terhubung ke AI')
    }, { status: 500 });
  }
}
