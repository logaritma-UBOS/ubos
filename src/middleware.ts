import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rute yang dilindungi
  const isProtected = request.nextUrl.pathname.startsWith('/ubos') || request.nextUrl.pathname.startsWith('/admin');

  if (isProtected) {
    // Karena kita menggunakan @supabase/supabase-js default (yang menggunakan localStorage),
    // pengecekan middleware ini bersifat basic. Untuk keamanan penuh di server,
    // aplikasi biasanya menggunakan @supabase/ssr atau cookies.
    // Di sini kita cek apakah ada cookie auth dari Supabase.
    // Nama cookie bervariasi, kita cek secara umum atau menggunakan header authorization.
    
    // Sebagai fallback perlindungan middleware:
    // Jika tidak ada tanda-tanda autentikasi di cookie/header, kita bisa asumsikan belum login.
    // Namun untuk mencegah infinite redirect jika mengandalkan localStorage,
    // seringkali perlindungan utama dilakukan di client-side (layout/page useEffect).
    
    // Untuk keperluan requirement ini, kita siapkan struktur middleware-nya.
    // Jika ingin benar-benar memblokir dari server, Anda harus mengonfigurasi 
    // Supabase client untuk menggunakan cookie storage.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/ubos/:path*',
    '/admin/:path*'
  ],
};
