export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { target, message } = await request.json();

    if (!target) {
      return NextResponse.json({ success: false, error: 'Target number is required' }, { status: 400 });
    }

    const formData = new URLSearchParams();
    formData.append('target', target);
    formData.append('message', message || 'Halo, ada yang bisa kami bantu?');

    const fonnteToken = process.env.NEXT_PUBLIC_FONNTE_TOKEN || process.env.FONNTE_TOKEN || 'rw47gsoTHcy86wGbxAtW';

    const fonnteRes = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': fonnteToken,
      },
      body: formData,
    });

    const data = await fonnteRes.json();
    
    if (!fonnteRes.ok || !data.status) {
      throw new Error(data.reason || 'Fonnte API Error');
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fonnte API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
