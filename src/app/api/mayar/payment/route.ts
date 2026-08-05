import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { merchantId, name, phone, email } = await req.json();

    // merchantId is optional — use phone as fallback identifier
    const identifier = merchantId || phone || email || 'unknown';

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
      custom_field: identifier
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

    // Use checkout URL from Mayar API - replace with custom domain if configured
    let checkoutUrl = data.data?.link || data.link || data.url;

    const customCheckoutDomain = process.env.MAYAR_CHECKOUT_DOMAIN;
    if (checkoutUrl && customCheckoutDomain && checkoutUrl.includes('logaritma-id.myr.id')) {
      checkoutUrl = checkoutUrl.replace('logaritma-id.myr.id', customCheckoutDomain);
    }

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
