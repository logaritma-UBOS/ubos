import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sales = await prisma.user.findUnique({ where: { email: 'logaritma.tim@gmail.com' } })({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      saleItems: {
        include: { product: true }
      }
    }
  });

  return NextResponse.json({ sales });
}

