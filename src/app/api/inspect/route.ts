import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "imagePublicId" TEXT;`);
    return NextResponse.json({ success: true, message: "Column imagePublicId added successfully" });
  } catch (e: any) {
    if (e.message?.includes("duplicate column name")) {
        return NextResponse.json({ success: true, message: "Column already exists" });
    }
    return NextResponse.json({ error: e.message });
  }
}
