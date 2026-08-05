import { NextRequest, NextResponse } from 'next/server';

// Test endpoint: GET /api/test-fonnte → cek apakah FONNTE_TOKEN tersedia
// Test endpoint: POST /api/test-fonnte → kirim pesan test ke nomor tujuan
export async function GET() {
  const token = process.env.FONNTE_TOKEN;
  return NextResponse.json({
    fonnte_token_set: !!token,
    fonnte_token_preview: token ? token.substring(0, 6) + '...' : 'NOT SET',
    gemini_key_set: !!process.env.GEMINI_API_KEY,
    supabase_service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export async function POST(req: NextRequest) {
  const { target } = await req.json();
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'FONNTE_TOKEN is not set in environment variables' }, { status: 500 });
  }

  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { 'Authorization': token },
    body: new URLSearchParams({
      target: target || '6285179660408',
      message: 'Test pesan dari Logaritma Bot ✅ Bot aktif dan siap!'
    })
  });

  const data = await res.json();
  return NextResponse.json({ status: res.status, fonnte_response: data });
}
