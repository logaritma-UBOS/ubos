import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Unauthorized' });
  const member = await prisma.teamMember.findUnique({ where: { email: session.user.email } });
  if (!member) return NextResponse.json({ success: false, error: 'Member not found' });

  try {
    const GATEWAY_URL = "http://202.155.94.170:3000";
    const targetUrl = GATEWAY_URL + '/status?session=team_' + member.id + '&t=' + Date.now();
    const res = await fetch(targetUrl, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.status === 'connected') return NextResponse.json({ success: true, status: 'CONNECTED', device: data.user?.id });
    if (data.status === 'waiting_for_scan') return NextResponse.json({ success: true, status: 'DISCONNECTED', qr: data.qr });
    
    // Pass raw data for debugging
    return NextResponse.json({ success: true, status: 'INITIALIZING', raw: data });
  } catch(e: any) {
    return NextResponse.json({ success: false, error: 'Gateway Error', msg: e.message });
  }
}
