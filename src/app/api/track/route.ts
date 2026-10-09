import { NextRequest, NextResponse } from "next/server";
import { fastDb } from "@/lib/fast-lane";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json();
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    // Bypass Prisma, eksekusi super ngebut ke Turso
    await fastDb.execute({
      sql: `INSERT INTO VisitorAnalytics (id, path, referrer, userAgent, createdAt) VALUES (lower(hex(randomblob(16))), ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [path || "/", referrer || null, userAgent]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
