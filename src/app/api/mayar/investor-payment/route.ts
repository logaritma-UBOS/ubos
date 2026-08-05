import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, phone, amount, fundedItems, itemIds } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
    const MAYAR_API_URL = process.env.MAYAR_API_URL || 'https://api.mayar.id/hl/v1';

    if (!MAYAR_API_KEY) {
      console.error('MAYAR_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Join funded items for description
    const itemsDescription = Array.isArray(fundedItems) && fundedItems.length > 0
      ? fundedItems.join(', ')
      : 'Pendanaan Umum';

    const payload = {
      name: name || 'Investor UBOS',
      email: email,
      amount: amount,
      mobile: phone || '080000000000',
      description: `Pendanaan Modal Logaritma UBOS: ${itemsDescription}`,
      redirectUrl: 'https://logaritma.id/investor?payment=success',
      // custom_field dikirim ke webhook untuk identifikasi item
      custom_field: JSON.stringify({
        type:     'INVESTOR_FUNDING',
        items:    itemsDescription,
        item_ids: Array.isArray(itemIds) ? itemIds : [],
      })
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

    let checkoutUrl = data.data?.link || data.link || data.url;

    if (checkoutUrl && checkoutUrl.includes('logaritma-id.myr.id')) {
      checkoutUrl = checkoutUrl.replace('logaritma-id.myr.id', 'mayar.link');
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
