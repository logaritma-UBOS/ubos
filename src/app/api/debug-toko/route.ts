import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.businessSetting.findFirst({
    where: { storeSlug: "warunkarsi" },
    include: { business: true }
  });
  return NextResponse.json(settings);
}
