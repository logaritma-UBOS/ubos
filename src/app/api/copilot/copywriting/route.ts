export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const FALLBACK_TEMPLATES = [
  `Halo Kakak dari {nama_usaha}, ini dari tim Logaritma 👋\n\nNgerasa capek ngurusin operasional bisnis tiap hari tapi profit gitu-gitu aja?\n\nItu tandanya Kakak butuh sistem yang beneran jalan. Kita ada penawaran spesial nih terkait:\n👉 *[TOPIK]*\n\nYuk, balas chat ini kalau Kakak mau kita bantu beresin masalah bisnisnya hari ini juga!`,
  
  `Halo owner {nama_usaha}! 👋\n\nPernah ngalamin stok berantakan atau closingan mandek?\n\nBanyak klien kami ngerasain hal yang sama sebelum pakai Logaritma. Nah, khusus hari ini kami mau nawarin solusi buat Kakak:\n👉 *[TOPIK]*\n\nJangan sampai kompetitor nyalip duluan. Balas pesannya sekarang ya Kak buat amankan kuotanya! 🔥`,

  `Permisi Kak dari {nama_usaha} 👋\n\nSaya perhatiin bisnis Kakak punya potensi buat di-scale up jauh lebih gede lagi.\n\nKebetulan banget nih, kita lagi ngadain program khusus buat bantu scale up dengan penawaran:\n👉 *[TOPIK]*\n\nMumpung slotnya masih ada, Kakak mau saya jelasin detailnya? Balas "MAU" aja ya Kak! 🚀`
];

export async function POST(req: NextRequest) {
  let requestTopic = 'Penawaran Spesial Logaritma';
  try {
    const { topic } = await req.json();
    if (topic) requestTopic = topic;

    if (!topic) {
      return NextResponse.json({ error: 'Topik/Penawaran is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY_PROSPECTING || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Langsung gunakan fallback jika tidak ada API key
      const randomFallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json({ result: randomFallback.replace(/\[TOPIK\]/g, requestTopic) });
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
    const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('fetch failed');
    
    // Jika quota habis atau error network, gunakan fallback
    if (isQuotaError) {
      const randomFallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json({ 
        result: randomFallback.replace(/\[TOPIK\]/g, requestTopic)
      });
    }

    return NextResponse.json({ error: msg || 'Gagal terhubung ke AI' }, { status: 500 });
  }
}
