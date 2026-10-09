import { NextResponse } from "next/server";
import { fastDb, initFastLane } from "@/lib/fast-lane";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.email) {
      await initFastLane();
      
      // Upsert raw SQL, jauh lebih ringan dari Prisma update
      await fastDb.execute({
        sql: `INSERT INTO _FastOnlineUsers (email, name, role, lastActive) 
              VALUES (?, ?, ?, CURRENT_TIMESTAMP) 
              ON CONFLICT(email) DO UPDATE SET 
              name = excluded.name, 
              role = excluded.role, 
              lastActive = CURRENT_TIMESTAMP`,
        args: [
            session.user.email, 
            session.user.name || "Unknown", 
            (session.user as any).role || "USER"
        ]
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
