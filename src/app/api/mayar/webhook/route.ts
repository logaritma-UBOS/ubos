import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need a server role key to bypass RLS since Webhook comes from external server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a production scenario, verify Mayar Webhook Signature here
    // const signature = req.headers.get('x-mayar-signature');
    
    // Typical Mayar webhook format: body.event, body.data
    const event = body.event || body.status; 
    
    // Check if event is PAID or success
    if (event === 'PAID' || event === 'payment.received' || body.status === 'success') {
      const payload = body.data || body;
      
      // Attempt to extract merchantId from custom_field or other references
      const merchantId = payload.custom_field || payload.reference_id;
      
      if (!merchantId) {
        console.error('Webhook payload missing merchantId identifier:', body);
        return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
      }

      // Fetch current merchant
      const { data: merchant, error: fetchError } = await supabaseAdmin
        .from('merchants')
        .select('trial_expires_at')
        .eq('id', merchantId)
        .single();
        
      if (fetchError || !merchant) {
        console.error('Failed to fetch merchant for webhook:', fetchError);
        return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
      }

      // Calculate new expiration date
      let expiresDate = new Date();
      if (merchant.trial_expires_at) {
        const currentExpiry = new Date(merchant.trial_expires_at);
        if (currentExpiry.getTime() > expiresDate.getTime()) {
          // If still active, add 30 days to the remaining active days
          expiresDate = currentExpiry;
        }
      }
      // Add 30 days
      expiresDate.setDate(expiresDate.getDate() + 30);

      // Update merchant
      const { error: updateError } = await supabaseAdmin
        .from('merchants')
        .update({ trial_expires_at: expiresDate.toISOString() })
        .eq('id', merchantId);

      if (updateError) {
        console.error('Failed to update merchant trial_expires_at:', updateError);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'License renewed for 30 days' });
    }

    // Acknowledge other events without action
    return NextResponse.json({ received: true, event: event });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
