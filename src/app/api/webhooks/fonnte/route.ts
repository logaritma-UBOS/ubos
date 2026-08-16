export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Anda adalah CS Support AI Logaritma.id yang ramah, sopan, empati, dan menggunakan gaya bahasa persuasif. Tugas Anda adalah membantu member bisnis kuliner (UBOS) menyelesaikan kendala teknis kasir, penjelasan fitur Margin Guard, HPP, atau panduan penggunaan sistem secara cepat dan ringkas. Jangan terlalu panjang lebar, langsung to the point namun tetap bersahabat.`;

// GET handler — required by Fonnte to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'Logaritma WhatsApp Bot Webhook' });
}

// POST handler — receives incoming WhatsApp messages from Fonnte
export async function POST(req: NextRequest) {
  // Instantiate inside handler so env vars are available at runtime only
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  try {
    // Fonnte webhook can send JSON or Form Data
    const contentType = req.headers.get('content-type') || '';
    let sender = '';
    let message = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      sender = body.sender;
      message = body.message || body.text;
    } else {
      const formData = await req.formData();
      sender = formData.get('sender') as string;
      message = (formData.get('message') || formData.get('text')) as string;
    }

    if (!sender || !message) {
      return NextResponse.json({ status: 'ignored', reason: 'Missing sender or message' });
    }

    // Normalize phone number to check both 08xxx and 628xxx formats
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

    // 1. Cek apakah nomor terdaftar di merchants
    const { data: merchant } = await supabaseAdmin
      .from('merchants')
      .select('nama_usaha')
      .or(`whatsapp.eq.${format62},whatsapp.eq.${format0}`)
      .limit(1)
      .maybeSingle();

    // Buat prompt kontekstual
    let aiPrompt = message;
    if (merchant && merchant.nama_usaha) {
      aiPrompt = `User adalah pemilik usaha: ${merchant.nama_usaha}.\n\nPertanyaan user:\n${message}`;
    }

    // 2. Generate jawaban via Gemini dengan Fallback
    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.7-flash'];
    let aiResponseText = '';

    for (const modelName of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: API response took too long')), 25000)
        );

        const generatePromise = ai.models.generateContent({
          model: modelName,
          contents: aiPrompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
          }
        });

        // @ts-ignore
        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        
        aiResponseText = response.text || '';
        if (aiResponseText) break;
      } catch (err) {
        console.warn(`[Fonnte Bot] Model ${modelName} attempt failed, retrying next...`);
      }
    }

    const answer = aiResponseText || 'Maaf, sistem AI kami sedang mengalami kendala (server sibuk). Silakan coba lagi nanti.';
    
    // 3. Tambahkan footer
    const finalMessage = `${answer}\n\n_Pesan otomatis dari Logaritma Support. Ketik 'ADMIN' jika butuh bicara dengan tim manusia._`;

    // 4. Kirim balasan via Fonnte
    const fonnteToken = process.env.FONNTE_API_TOKEN || 'rw47gsoTHcy86wGbxAtW';
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
      console.error('[Fonnte Bot] FONNTE_API_TOKEN is missing in environment variables');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('[Fonnte Bot] Webhook Error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
