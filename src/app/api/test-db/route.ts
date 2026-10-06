import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const hash = await bcrypt.hash('adminlog2026', 10);
    const updated = await prisma.user.upsert({
      where: { email: 'logaritma.tim@gmail.com' },
      update: { passwordHash: hash, role: 'SUPER_ADMIN' },
      create: {
        id: Math.random().toString(36).substring(2),
        email: 'logaritma.tim@gmail.com',
        name: 'Tim Logaritma',
        passwordHash: hash,
        role: 'SUPER_ADMIN'
      }
    });
    return NextResponse.json({ success: true, email: updated.email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
