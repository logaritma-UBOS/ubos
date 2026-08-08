export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const apiKeyProspecting = process.env.GEMINI_API_KEY_PROSPECTING;
    const apiKeyFallback = process.env.GEMINI_API_KEY;
    
    let apiKey = apiKeyProspecting || apiKeyFallback;

    if (!apiKey) {
      // Langsung gunakan fallback jika tidak ada API key
      const randomFallback = FALLBACK_TEMPLATES[Math.floor(Math.random() * FALLBACK_TEMPLATES.length)];
      return NextResponse.json({ result: randomFallback.replace(/\[TOPIK\]/g, requestTopic) });
    }

    const systemInstruction = `Anda adalah Admin dari Logaritma.id & UBOS. Tugas Anda adalah membuat pesan WhatsApp chat pribadi yang singkat, padat, ramah, dan sangat natural (conversational) menggunakan gaya copywriting Dewa Eka Prayoga. HINDARI kata-kata kaku atau template kaku seperti 'Kami ada penawaran spesial nih terkait:'. Tulis pesan secara fleksibel sesuai TOPIK yang diberikan user. Wajib gunakan placeholder {nama_usaha} dan sertakan Call to Action (CTA) singkat di akhir chat.`;

    let responseText = "";
    
    try {
       const genAI = new GoogleGenerativeAI(apiKey);
       const model = genAI.getGenerativeModel({ 
         model: "gemini-3.6-flash",
         systemInstruction
       });
       
       const result = await model.generateContent(`Buatkan pesan WhatsApp tentang: ${topic}`);
       responseText = result.response.text();
    } catch (e: any) {
       // Jika gagal dan apiKey saat ini adalah prospecting, fallback ke main API key
       if (apiKeyProspecting && apiKey === apiKeyProspecting && apiKeyFallback) {
         console.warn('API Key Prospecting gagal, fallback ke GEMINI_API_KEY...');
         const genAIFallback = new GoogleGenerativeAI(apiKeyFallback);
         const modelFallback = genAIFallback.getGenerativeModel({ 
           model: "gemini-3.6-flash",
           systemInstruction
         });
         const result = await modelFallback.generateContent(`Buatkan pesan WhatsApp tentang: ${topic}`);
         responseText = result.response.text();
       } else {
         throw e;
       }
    }

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error('Copywriting Generate Error:', error?.message || error);
    const msg = error?.message || '';
    const isQuotaError = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('fetch failed');
    
    // Jika quota habis atau error network, kembalikan pesan error yang jelas
    if (isQuotaError) {
      return NextResponse.json({ 
        error: 'Kuota API Gemini Anda telah habis (Error 429). Silakan gunakan kunci API baru atau upgrade akun Google AI Studio Anda ke berbayar agar bisa menggunakan fitur AI Copywriting secara dinamis.'
      }, { status: 429 });
    }

    return NextResponse.json({ error: msg || 'Gagal terhubung ke AI' }, { status: 500 });
  }
}
