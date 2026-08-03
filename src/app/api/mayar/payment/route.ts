import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client'; // Server routes should ideally use a server client, but we'll use this if it works or a service role key. Wait, client might not have admin rights, but for reading merchant it's fine if RLS allows it, or we just rely on client sending the data. Actually, RLS might block if no active session in server. Let's just expect the client to send the necessary merchant data directly in the POST body to avoid RLS issues, or we use Supabase admin.

export async function POST(req: Request) {
  try {
    const { merchantId, name, phone, email } = await req.json();

    if (!merchantId) {
      return NextResponse.json({ error: 'Missing merchantId' }, { status: 400 });
    }

    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
    const MAYAR_API_URL = process.env.MAYAR_API_URL || 'https://api.mayar.id/hl/v1';

    if (!MAYAR_API_KEY) {
      console.error('MAYAR_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const payload = {
      name: name || 'Toko Member UBOS',
      email: email || 'member@logaritma.id',
      amount: 49000,
      mobile: phone || '080000000000',
      description: `Perpanjangan Lisensi Premium UBOS (1 Bulan) - ${name || 'Toko'}`,
      redirectUrl: 'https://logaritma.id/app?payment=success',
      // We pass merchantId in custom fields or metadata if Mayar supports it. Or append to redirectUrl, but we'll handle webhook via email/mobile or custom field. Let's add custom_field if possible.
      custom_field: merchantId
    };

    const response = await fetch(`${MAYAR_API_URL}/payment/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAYAR_API_KEY.replace(/"/g, '')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mayar API error:', data);
      return NextResponse.json({ error: 'Failed to create payment link', details: data }, { status: response.status });
    }

    // Usually Mayar returns the link in data.link or data.url
    const checkoutUrl = data.data?.link || data.link || data.url;

    if (!checkoutUrl) {
      console.error('Could not find checkout URL in Mayar response:', data);
      return NextResponse.json({ error: 'Invalid response from payment gateway' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Payment generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
