import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzExZTAxZi01ZjI4LTQ3MDgtYTc1Yy1iODE2ZjczZjM3YmQiLCJhY2NvdW50SWQiOiJjMTQyNmNkNi1lNTJiLTRmNzktYjlhNS1iMGY4ZmRjMjc2YzMiLCJjcmVhdGVkQXQiOiIxNzg4MDcwMjg2MDAxIiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoibG9nYXJpdG1hLnRpbUBnbWFpbC5jb20iLCJuYW1lIjoiTG9nYXJpdG1hIiwibGluayI6ImxvZ2FyaXRtYS1wYXkiLCJpc1NlbGZEb21haW4iOmZhbHNlLCJpYXQiOjE3ODgwNzAyODZ9.i-0x6ok50c2ys7PpkbAEuLESGZHZ6glNpe-OjHnbnnXHjEAYgn2SkrhRxBUcWvDQvOaV8uIs9wo7La4aM0KtDcoHfbiH7jEtrSgEqLPG_50ZbUbhFN-alCT-_CUOUXMhbEbD3Xrh3L-QHOmwwI74-AqhUwius0d762VvF6tfQG8CHvabcn1GJHuYTikAAiKWNpiILDoyReoF2jcGn_vN4zrEoVb8Ma0oed2kBxYZRnEGytnDn45rrMt3TfP96hWBCcQZZO3Yo4UZfbSyiYem3QmT2iNTRw4quUONdcF73Hy7acaUqunIioy52p6PC3gHJVx1eKxsAbzalRZbYjKDLw";
    
    // Fetch all transactions from Mayar API
    const res = await fetch("https://api.mayar.id/hl/v1/transaction?limit=100", {
      headers: { "Authorization": `Bearer ${MAYAR_API_KEY}` }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Mayar API", status: res.status });
    }
    
    const data = await res.json();
    const transactions = data.data || [];
    
    let updated = 0;
    
    // Fetch our DB revenues
    const revenues = await prisma.ubosRevenue.findMany({ where: { status: "PAID" } });
    
    for (const rev of revenues) {
      // Find the corresponding transaction in Mayar
      const trx = transactions.find((t: any) => t.id === rev.mayarTrxId || t.reference === rev.mayarTrxId || t.invoice_id === rev.mayarTrxId);
      
      if (trx) {
        // Determine the real net amount after fees
        const netAmount = Number(trx.net_amount || trx.amount || rev.amount);
        
        if (netAmount !== rev.amount) {
          await prisma.ubosRevenue.update({
            where: { id: rev.id },
            data: { amount: netAmount }
          });
          updated++;
        }
      }
    }
    
    return NextResponse.json({ success: true, updated, fetched: transactions.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
