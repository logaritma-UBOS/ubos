import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const info = await prisma.$queryRawUnsafe('PRAGMA table_info("Product");')
    return NextResponse.json({ success: true, info })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

