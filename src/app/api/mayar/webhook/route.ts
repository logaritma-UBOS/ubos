export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mapping ID item ke nama tabel funding_items
const ITEM_ID_MAP: Record<string, string> = {
  'hosting':      'Hosting & Database (Vercel, Supabase)',
  'wa_gateway':   'WhatsApp Gateway API',
  'ai_token':     'OpenAI / Gemini API Tokens',
  'gtm_ads':      'Pemasaran Awal (GTM / Meta Ads)',
  'cash_reserve': 'Cadangan Kas Operasional',
};

export async function POST(req: Request) {
  // Instantiate inside handler so env vars are available at runtime only
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  try {
    const body = await req.json();

    // Mayar mengirim event dalam beberapa format berbeda
    const event = body.event || body.status;
    const isPaid =
      event === 'PAID' ||
      event === 'payment.received' ||
      event === 'payment.success' ||
      body.status === 'success' ||
      body.status === 'PAID';

    if (!isPaid) {
      // Event lain (pending, failed, dll) – ack tanpa aksi
      return NextResponse.json({ received: true, event });
    }

    const payload = body.data || body;

    // ── Parse custom_field (bisa JSON atau string biasa) ─────────────────
    let customFieldObj: any = null;
    try {
      if (payload.custom_field) {
        customFieldObj =
          typeof payload.custom_field === 'string'
            ? JSON.parse(payload.custom_field)
            : payload.custom_field;
      }
    } catch (_) {}

    // ════════════════════════════════════════════════════════════════════
    // PATH A: INVESTOR FUNDING
    // ════════════════════════════════════════════════════════════════════
    if (customFieldObj?.type === 'INVESTOR_FUNDING') {
      const amount    = Number(payload.amount || 0);
      const itemIds   = (customFieldObj.item_ids  || []) as string[];
      const itemNames = (customFieldObj.items      || '') as string;
      const email     = payload.email   || payload.customer?.email || '';
      const name      = payload.name    || payload.customer?.name  || 'Investor';

      // 1. Update is_funded di tabel funding_items ────────────────────────
      if (itemIds.length > 0) {
        const titles = itemIds.map(id => ITEM_ID_MAP[id]).filter(Boolean);
        if (titles.length > 0) {
          const { error: fundErr } = await supabaseAdmin
            .from('funding_items')
            .update({ is_funded: true, funded_by: name, funded_at: new Date().toISOString() })
            .in('title', titles);

          if (fundErr) console.error('funding_items update error:', fundErr);
        }
      }

      // 2. Insert UTAMA ke cash_transactions agar sinkron dengan Finance Dashboard
      const desc = `Pendanaan Investor: ${itemNames || itemIds.join(', ')}`;
      
      const { error: cashTxErr } = await supabaseAdmin.from('cash_transactions').insert([{
        transaction_date: new Date().toISOString().split('T')[0],
        type:        'IN',
        category:    'Inject Modal Investor',
        description: desc,
        amount:      amount,
      }]);
      
      if (cashTxErr) console.error('cash_transactions insert error:', cashTxErr);
      
      // Catat juga ke capital_transactions sebagai log duplikat/histori spesifik investor
      await supabaseAdmin.from('capital_transactions').insert([{
        tipe:       'INFLOW',
        kategori:   'Modal Investor',
        nominal:    amount,
        deskripsi:  desc,
        nama:       name,
        email:      email,
        created_at: new Date().toISOString(),
      }]);

      // 3. Buat akun Supabase Auth untuk investor ─────────────────────────
      if (email) {
        const password = 'LogaritmaInvestor123!';
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name },
        });

        if (userError) {
          console.error('Create investor user error (may already exist):', userError.message);
        }

        const userId = userData?.user?.id;
        if (userId) {
          await supabaseAdmin.from('merchants').upsert({
            user_id:              userId,
            nama_usaha:           name,
            whatsapp:             payload.mobile || payload.customer?.phone || '',
            is_investor_view_only: true,
            kategori_usaha:       'Investor',
            created_at:           new Date().toISOString(),
            last_active_at:       new Date().toISOString(),
          }, { onConflict: 'user_id' });
        } else {
          // Fallback: investor sudah punya akun – tandai saja
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = usersData?.users.find(u => u.email === email);
          if (existing) {
            await supabaseAdmin.from('merchants').update({ is_investor_view_only: true }).eq('user_id', existing.id);
          }
        }
      }

      return NextResponse.json({ success: true, message: 'Investor funding processed' });
    }

    // ════════════════════════════════════════════════════════════════════
    // PATH B: MERCHANT SUBSCRIPTION RENEWAL
    // ════════════════════════════════════════════════════════════════════
    const merchantId = customFieldObj?.merchant_id || payload.custom_field || payload.reference_id;

    if (!merchantId) {
      console.error('Missing merchantId in webhook payload:', body);
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    const { data: merchant, error: fetchErr } = await supabaseAdmin
      .from('merchants')
      .select('trial_expires_at')
      .eq('id', merchantId)
      .single();

    if (fetchErr || !merchant) {
      console.error('Merchant not found for renewal:', fetchErr);
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    let expiresDate = new Date();
    if (merchant.trial_expires_at) {
      const current = new Date(merchant.trial_expires_at);
      if (current.getTime() > expiresDate.getTime()) expiresDate = current;
    }
    expiresDate.setDate(expiresDate.getDate() + 30);

    const { error: updateErr } = await supabaseAdmin
      .from('merchants')
      .update({ trial_expires_at: expiresDate.toISOString() })
      .eq('id', merchantId);

    if (updateErr) {
      console.error('Failed to renew merchant:', updateErr);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'License renewed 30 days' });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
