import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const articles = await prisma.ubosFeedContent.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    if (articles.length === 0) {
      return NextResponse.json([{
        id: "default",
        title: "Cara Menaikkan AOV Tanpa Diskon",
        content: "Teknik bundling silang dan penempatan produk komplementer dapat meningkatkan AOV secara signifikan tanpa harus membakar margin dengan diskon besar-besaran.",
        category: "VIP INSIGHT"
      }]);
    }

    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json([]);
  }
}
