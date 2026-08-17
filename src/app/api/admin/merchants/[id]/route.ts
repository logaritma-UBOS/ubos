import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const merchantId = params.id;
    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Ambil semua ID produk dan transaksi milik merchant ini
    const { data: prodList } = await supabaseAdmin.from('products').select('id').eq('merchant_id', merchantId);
    const { data: trxList } = await supabaseAdmin.from('transactions').select('id').eq('merchant_id', merchantId);
    
    const prodIds = prodList?.map((p: any) => p.id) || [];
    const trxIds = trxList?.map((t: any) => t.id) || [];

    // 2. Hapus SEMUA ketergantungan yang mengikat produk (transaction_items & recipes)
    if (prodIds.length > 0) {
      await supabaseAdmin.from('recipes').delete().in('product_id', prodIds);
      await supabaseAdmin.from('transaction_items').delete().in('product_id', prodIds);
    }
    
    // 3. Hapus SEMUA ketergantungan transaksi (untuk berjaga-jaga jika ada sisa item)
    if (trxIds.length > 0) {
      await supabaseAdmin.from('transaction_items').delete().in('transaction_id', trxIds);
    }
    
    // 4. Hapus data utama merchant di berbagai tabel lainnya
    await Promise.all([
      supabaseAdmin.from('transactions').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('products').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('customers').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('wallets').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('cash_transactions').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('crm_broadcast_logs').delete().eq('merchant_id', merchantId),
      supabaseAdmin.from('subscriptions').delete().eq('merchant_id', merchantId)
    ]);

    // 5. Terakhir, hapus entitas merchant itu sendiri
    const { error } = await supabaseAdmin.from('merchants').delete().eq('id', merchantId);
    
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Merchant Error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
