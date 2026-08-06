export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  // Instantiate inside handler so env vars are available at runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const data = await req.json();
    
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || '';
    
    const payload = {
      ip_address: ip,
      user_agent: userAgent,
      referrer: data.referrer || '',
      utm_source: data.utm_source || '',
      utm_medium: data.utm_medium || '',
      utm_campaign: data.utm_campaign || '',
      path: data.path || '/',
      session_id: data.session_id || null,
      visited_at: new Date().toISOString()
    };

    const { error } = await supabase.from('visitor_logs').insert([payload]);

    if (error) {
      console.error('Error logging visitor:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error parsing visitor log request:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
