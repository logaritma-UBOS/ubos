import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { target, message, merchantId, templateType } = await request.json();

    if (!target || !message) {
      return NextResponse.json(
        { error: 'Target dan Message wajib diisi' },
        { status: 400 }
      );
    }

    const fonnteToken = process.env.FONNTE_API_TOKEN;
    if (!fonnteToken || fonnteToken === 'FONNTE_TOKEN_PLACEHOLDER') {
      console.warn('Fonnte token is missing or placeholder. Simulating successful send for dev mode.');
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      // Call actual Fonnte API
      const formData = new FormData();
      formData.append('target', target);
      formData.append('message', message);

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteToken,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok || !responseData.status) {
        throw new Error(responseData.reason || 'Gagal mengirim pesan via Fonnte');
      }
    }

    // Simpan ke crm_broadcast_logs (1-on-1 mode)
    // Supabase client instance used in API routes should ideally use service role key if modifying protected data,
    // but we use the public client with permissive RLS based on current schema configurations.
    const logPayload = {
      campaign_name: '1-ON-1 SMART CRM', // Fallback for NOT NULL legacy column
      target_audience: target, // Fallback for NOT NULL legacy column
      message_template: templateType || 'Custom Message', // Fallback for NOT NULL legacy column
      merchant_id: merchantId || null,
      phone: target,
      message: message,
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_count: 1
    };

    const { error: dbError } = await supabase
      .from('crm_broadcast_logs')
      .insert([logPayload]);

    if (dbError) {
      console.error('Gagal mencatat log CRM ke database:', dbError);
      // We don't fail the request if just the logging fails, but we might want to know.
    }

    return NextResponse.json({ success: true, message: 'Pesan terkirim' });
  } catch (error: any) {
    console.error('Fonnte API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
