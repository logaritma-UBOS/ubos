import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzExZTAxZi01ZjI4LTQ3MDgtYTc1Yy1iODE2ZjczZjM3YmQiLCJhY2NvdW50SWQiOiJjMTQyNmNkNi1lNTJiLTRmNzktYjlhNS1iMGY4ZmRjMjc2YzMiLCJjcmVhdGVkQXQiOiIxNzg4MDcwMjg2MDAxIiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoibG9nYXJpdG1hLnRpbUBnbWFpbC5jb20iLCJuYW1lIjoiTG9nYXJpdG1hIiwibGluayI6ImxvZ2FyaXRtYS1wYXkiLCJpc1NlbGZEb21haW4iOmZhbHNlLCJpYXQiOjE3ODgwNzAyODZ9.i-0x6ok50c2ys7PpkbAEuLESGZHZ6glNpe-OjHnbnnXHjEAYgn2SkrhRxBUcWvDQvOaV8uIs9wo7La4aM0KtDcoHfbiH7jEtrSgEqLPG_50ZbUbhFN-alCT-_CUOUXMhbEbD3Xrh3L-QHOmwwI74-AqhUwius0d762VvF6tfQG8CHvabcn1GJHuYTikAAiKWNpiILDoyReoF2jcGn_vN4zrEoVb8Ma0oed2kBxYZRnEGytnDn45rrMt3TfP96hWBCcQZZO3Yo4UZfbSyiYem3QmT2iNTRw4quUONdcF73Hy7acaUqunIioy52p6PC3gHJVx1eKxsAbzalRZbYjKDLw";
    
    // Fetch transactions from Mayar
    const res = await fetch("https://api.mayar.id/hl/v1/transaction?limit=100", {
      headers: { "Authorization": `Bearer ${MAYAR_API_KEY}` }
    });
    const data = await res.json();
    const transactions = data.data || [];

    // Fetch existing revenues
    const revenues = await prisma.ubosRevenue.findMany();
    
    // Return raw counts
    return NextResponse.json({ 
      mayarTotalCount: transactions.length,
      mayarSuccessCount: transactions.filter((t: any) => t.status === "PAID" || t.status === "SETTLED" || t.status === "SUCCESS").length,
      dbTotalCount: revenues.length,
      dbPaidCount: revenues.filter(r => r.status === "PAID").length,
      // Sample of what's in mayar
      mayarSample: transactions.slice(0, 5).map((t: any) => ({ id: t.id, status: t.status, amount: t.amount })),
      // Sample of what's in db
      dbSample: revenues.slice(0, 5).map(r => ({ mayarTrxId: r.mayarTrxId, status: r.status, amount: r.amount }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
