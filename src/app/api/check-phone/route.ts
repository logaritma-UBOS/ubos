export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function normalizePhone(raw: string): { format62: string; format0: string } {
  let phone = raw.replace(/\D/g, '');
  let format62 = phone;
  let format0 = phone;

  if (phone.startsWith('0')) {
    format62 = '62' + phone.slice(1);
    format0 = phone;
  } else if (phone.startsWith('8')) {
    format62 = '62' + phone;
    format0 = '0' + phone;
  } else if (phone.startsWith('62')) {
    format62 = phone;
    format0 = '0' + phone.slice(2);
  }

  return { format62, format0 };
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone');

  if (!phone || phone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ found: false });
  }

  // Instantiate inside handler so env vars are available at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { format62, format0 } = normalizePhone(phone);

  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select('nama_usaha, kategori_usaha, whatsapp')
    .or(`whatsapp.eq.${format62},whatsapp.eq.${format0}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[check-phone] Supabase error:', error.message);
    return NextResponse.json({ found: false });
  }

  if (data) {
    return NextResponse.json({
      found: true,
      nama_usaha: data.nama_usaha || '',
      kategori_usaha: data.kategori_usaha || '',
    });
  }

  return NextResponse.json({ found: false });
}
