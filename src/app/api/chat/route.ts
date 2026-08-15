import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY');
      return NextResponse.json({ error: 'API key configuration missing' }, { status: 500 });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `Kamu adalah Konsultan HPP Spesialis dari Logaritma.id. 
Tugasmu adalah membantu pemilik UMKM dengan perhitungan HPP, strategi pricing, dan perlindungan margin.
Gaya bahasamu harus singkat, padat, sopan, dan kasual seperti chat dengan teman (gunakan 'kamu', 'aku', atau 'Kak'). Jangan kaku.
Jangan bertele-tele, langsung pada intinya. Jika relevan, sarankan mereka untuk mencoba fitur kalkulator HPP atau layanan margin guard dari UBOS Logaritma.id.`;

    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, sistem sedang sibuk. Bisa diulangi Kak?";

    return NextResponse.json({ reply: replyText });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
