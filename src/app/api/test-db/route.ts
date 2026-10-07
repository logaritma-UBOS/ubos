import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const members = await prisma.teamMember.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    return NextResponse.json({ members });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
