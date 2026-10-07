import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
  const member = await prisma.teamMember.findUnique({ where: { email: 'baim@logaritma.id' } });
  return NextResponse.json({ id: member?.id });
}
