import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
  const member1 = await prisma.teamMember.findUnique({ where: { email: 'logaritma.tim@gmail.com' } });
  const member2 = await prisma.teamMember.findUnique({ where: { email: 'baim@logaritma.id' } });
  return NextResponse.json({ id1: member1?.id, id2: member2?.id });
}
