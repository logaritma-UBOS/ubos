import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  try {
    const payload = await req.json();

    // Verify Mayar Webhook Event
    if (payload.event === 'payment.received' || payload.status === 'payment.received') {
      const paymentData = payload.data || payload;
      
      // Mengambil nominal bersih setelah fee gateway (jika ada) atau gross
      const netAmount = Number(paymentData.net_amount || paymentData.amount);
      if (isNaN(netAmount) || netAmount <= 0) {
        return NextResponse.json({ success: true, message: 'Invalid or zero amount, skipping.' });
      }

      // 1. Potong Alokasi OPEX/Kas (20%)
      const opexCut = netAmount * 0.20;
      const profitToSplit = netAmount * 0.80;

      // Catat ke financial_transactions sebagai omzet kotor & potongan kas
      const { data: tx, error: txError } = await supabase.from('financial_transactions').insert([{
        transaction_date: new Date().toISOString(),
        stream_category: 'UBOS Core', // Default atau bisa di-parse dari payload
        source_name: paymentData.customer_name || 'System Auto-payment',
        gross_amount: netAmount,
        affiliate_cut: 0,
        net_profit: profitToSplit, 
        notes: `Mayar Webhook - OPEX 20%: Rp${opexCut}`
      }]).select().single();

      if (txError) throw txError;

      // 2. Fetch Royalty Percentages dari founder_shares
      const { data: shares, error: sharesError } = await supabase.from('founder_shares').select('*');
      if (sharesError) throw sharesError;

      // 3. Distribusi Royalti ke masing-masing founder
      if (shares && shares.length > 0) {
        const royaltyLogs = shares.map(founder => {
          const percentage = Number(founder.royalty_percentage) / 100;
          const splitAmount = profitToSplit * percentage;
          
          return {
            author_name: 'SYSTEM',
            note_text: `ROYALTY SPLIT [${founder.name}]: Rp${splitAmount} (${founder.royalty_percentage}%) dari transaksi ${paymentData.id || 'N/A'}`,
            priority: 'HIGH'
          };
        });

        // Simpan log pembagian royalti ke founder_notes sebagai log historis
        if (royaltyLogs.length > 0) {
          await supabase.from('founder_notes').insert(royaltyLogs);
        }
      }

      return NextResponse.json({ success: true, message: 'Royalty split processed' });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('Mayar Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
