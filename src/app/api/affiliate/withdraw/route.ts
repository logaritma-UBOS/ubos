export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { merchant_id, bank_name, account_number, account_name, amount } = await req.json();

    if (!merchant_id || !bank_name || !account_number || !account_name || !amount) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (Number(amount) < 50000) {
      return NextResponse.json({ success: false, error: 'Minimal penarikan adalah Rp 50.000' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Cek saldo merchant
    const { data: merchant, error: fetchErr } = await supabaseAdmin
      .from('merchants')
      .select('commission_balance')
      .eq('id', merchant_id)
      .single();

    if (fetchErr || !merchant) {
      return NextResponse.json({ success: false, error: 'Merchant tidak ditemukan' }, { status: 404 });
    }

    if ((merchant.commission_balance || 0) < Number(amount)) {
      return NextResponse.json({ success: false, error: 'Saldo komisi tidak mencukupi' }, { status: 400 });
    }

    // 2. Call Mayar Disbursement API
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
    const MAYAR_API_URL = process.env.MAYAR_API_URL || 'https://api.mayar.id/hl/v1';

    if (!MAYAR_API_KEY) {
      console.error('MAYAR_API_KEY is not set');
      return NextResponse.json({ success: false, error: 'Konfigurasi server bermasalah' }, { status: 500 });
    }

    // Payload Mayar Disbursement v1
    const payload = {
      amount: Number(amount),
      bankCode: bank_name,
      accountNumber: account_number,
      accountName: account_name,
      description: `Affiliate Payout UBOS - ${merchant_id}`,
      // Optionally provide a reference / custom ID
      reference: `w-${Date.now()}`
    };

    const response = await fetch(`${MAYAR_API_URL}/disbursement/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAYAR_API_KEY.replace(/"/g, '')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const mayarData = await response.json();

    if (!response.ok) {
      console.error('Mayar Disbursement API error:', mayarData);
      return NextResponse.json({ success: false, error: 'Gagal menghubungi sistem pencairan (Mayar)', details: mayarData }, { status: 500 });
    }

    // 3. Deduct commission balance & Insert payout request
    const newBalance = (merchant.commission_balance || 0) - Number(amount);

    const { error: updateErr } = await supabaseAdmin
      .from('merchants')
      .update({ commission_balance: newBalance })
      .eq('id', merchant_id);

    if (updateErr) {
      console.error('Failed to deduct balance:', updateErr);
      return NextResponse.json({ success: false, error: 'Gagal memotong saldo di database' }, { status: 500 });
    }

    const { error: insertErr } = await supabaseAdmin
      .from('payout_requests')
      .insert([{
        merchant_id,
        bank_name,
        account_number,
        account_name,
        amount: Number(amount),
        status: 'Processing'
      }]);

    if (insertErr) {
      console.error('Failed to record payout request:', insertErr);
    }

    return NextResponse.json({ success: true, message: 'Disbursement sedang diproses' });

  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
