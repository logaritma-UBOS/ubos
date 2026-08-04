import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service-role or anon server-side client (no cookie auth needed for analytics writes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, metadata } = body;

    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_type,
          referrer: metadata?.referrer || 'Direct',
          is_mobile: metadata?.is_mobile ?? false,
          metadata: metadata || {},
          created_at: metadata?.timestamp || new Date().toISOString(),
        }
      ]);

    if (error) {
      // Silently fail on analytics — don't break UX
      console.error('[Track API] Failed to insert event:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Track API] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}
