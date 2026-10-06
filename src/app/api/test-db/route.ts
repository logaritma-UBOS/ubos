import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'logaritma.tim@gmail.com' } });
    if (!user) return NextResponse.json({ error: 'User not found' });
    
    const hash = user.passwordHash;
    const match = await bcrypt.compare('adminlog2026', hash || '');
    
    return NextResponse.json({ match, hashPrefix: hash?.substring(0,10) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack });
  }
}
