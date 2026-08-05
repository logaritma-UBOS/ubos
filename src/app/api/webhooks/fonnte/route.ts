import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `Anda adalah CS Support AI Logaritma.id yang ramah, sopan, empati, dan menggunakan gaya bahasa persuasif. Tugas Anda adalah membantu member bisnis kuliner (UBOS) menyelesaikan kendala teknis kasir, penjelasan fitur Margin Guard, HPP, atau panduan penggunaan sistem secara cepat dan ringkas. Jangan terlalu panjang lebar, langsung to the point namun tetap bersahabat.`;

export async function POST(req: NextRequest) {
  try {
    // Fonnte webhook can send JSON or Form Data
    const contentType = req.headers.get('content-type') || '';
    let sender = '';
    let message = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      sender = body.sender;
      message = body.message || body.text; // Fonnte sometimes uses 'text' or 'message'
    } else {
      const formData = await req.formData();
      sender = formData.get('sender') as string;
      message = (formData.get('message') || formData.get('text')) as string;
    }

    if (!sender || !message) {
      return NextResponse.json({ status: 'ignored', reason: 'Missing sender or message' });
    }

    // Fonnte usually sends sender format like 628xxx or 08xxx
    // Let's normalize it to check in Supabase
    let rawWA = sender.replace(/\D/g, '');
    let format62 = rawWA;
    let format0 = rawWA;

    if (rawWA.startsWith('0')) {
      format62 = '62' + rawWA.slice(1);
    } else if (rawWA.startsWith('8')) {
      format62 = '62' + rawWA;
      format0 = '0' + rawWA;
    } else if (rawWA.startsWith('62')) {
      format0 = '0' + rawWA.slice(2);
    }

    // 1. Cek apakah member terdaftar
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('nama_usaha')
      .or(`whatsapp.eq.${format62},whatsapp.eq.${format0}`)
      .limit(1)
      .maybeSingle();

    let aiPrompt = message;
    if (merchant && merchant.nama_usaha) {
      aiPrompt = `User adalah pemilik usaha: ${merchant.nama_usaha}.\n\nPertanyaan user:\n${message}`;
    }

    // 2. Kirim ke Gemini
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: aiPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    let answer = aiResponse.text || 'Maaf, saya sedang mengalami kendala. Silakan coba lagi nanti.';
    
    // 3. Tambahkan footer
    const finalMessage = `${answer}\n\n_Pesan otomatis dari Logaritma Support. Ketik 'ADMIN' jika butuh bicara dengan tim manusia._`;

    // 4. Kirim balasan via Fonnte
    const fonnteToken = process.env.FONNTE_TOKEN;
    if (fonnteToken) {
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken
        },
        body: new URLSearchParams({
          target: sender,
          message: finalMessage
        })
      });
    } else {
      console.error('FONNTE_TOKEN is missing in environment variables');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Fonnte Webhook Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
