export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  console.log("SIGNUP API HIT");

  try {
    const body = await req.json();
    const { nama_usaha, no_wa, kategori, password, funnel_destination, ref_id } = body;

    if (!no_wa || !password) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 200 });
    }

    // Gunakan Service Role Key untuk bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Cek apakah WA sudah ada
    const { data: existingLead, error: checkErr } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('no_wa', no_wa)
      .maybeSingle();

    if (checkErr) {
      return NextResponse.json({ success: false, error: 'Gagal mengecek data' }, { status: 200 });
    }

    if (existingLead) {
      // 2. User Lama: Cek Password
      if (existingLead.password_session === password) {
        return NextResponse.json({
          success: true,
          isNew: false,
          data: existingLead
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Nomor WhatsApp sudah terdaftar. Password tidak sesuai.'
        }, { status: 200 });
      }
    }

    // 3. Resolve Affiliate (ref_id)
    let referredBy = null;
    if (ref_id) {
      // Coba cari merchant berdasarkan slug, id (UUID), atau no_wa
      // UUID regex test
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ref_id);
      
      let query = supabaseAdmin.from('merchants').select('id, affiliate_leads').limit(1);
      
      if (isUUID) {
        query = query.eq('id', ref_id);
      } else {
        query = query.or(`slug.eq.${ref_id},no_wa.eq.${ref_id}`);
      }

      const { data: referrerData } = await query.maybeSingle();

      if (referrerData) {
        referredBy = referrerData.id;
        // Increment affiliate_leads
        await supabaseAdmin.from('merchants')
          .update({ affiliate_leads: (referrerData.affiliate_leads || 0) + 1 })
          .eq('id', referrerData.id);
      }
    }

    // 4. User Baru: Insert
    const insertPayload = {
      nama_usaha,
      no_wa,
      whatsapp: no_wa,
      kategori,
      status: 'New',
      password_session: password,
      funnel_destination,
      referred_by: referredBy
    };

    let { error: insertErr } = await supabaseAdmin.from('leads').insert([insertPayload]);

    if (insertErr && insertErr.code === 'PGRST204') {
      console.warn("Fallback: Tabel leads belum memiliki kolom password_session / referred_by. Melakukan insert minimal...");
      // Coba minimal insert
      const minimalPayload = {
        nama_usaha,
        no_wa,
        kategori,
        status: 'New Lead'
      };
      const retry = await supabaseAdmin.from('leads').insert([minimalPayload]);
      insertErr = retry.error;
    }

    if (insertErr) {
      console.error("Insert Err:", insertErr);
      return NextResponse.json({
        success: false,
        error: 'Gagal mendaftar. Silakan coba lagi.'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      isNew: true
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
