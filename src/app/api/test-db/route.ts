import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
  const user = await prisma.user.findUnique({ where: { email: 'logaritma.tim@gmail.com' }, include: { businesses: true } });
  return NextResponse.json({ user });
}
