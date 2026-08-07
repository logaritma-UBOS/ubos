export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  console.log("SIGNUP API HIT");

  try {
    const body = await req.json();
    const { nama_usaha, no_wa, kategori, password, funnel_destination } = body;

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

    // 3. User Baru: Insert
    const { error: insertErr } = await supabaseAdmin.from('leads').insert([
      {
        nama_usaha,
        no_wa,
        kategori,
        status: 'New Lead',
        password_session: password,
        funnel_destination
      }
    ]);

    if (insertErr) {
      console.error("Insert Err:", insertErr);
      return NextResponse.json({
        success: false,
        error: insertErr.code === 'PGRST204' 
          ? 'Tabel leads di Supabase belum memiliki kolom password_session. Harap jalankan SQL Migration.' 
          : 'Gagal mendaftar. Silakan coba lagi.'
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
