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

    // Fetch existing revenues to avoid duplicates
    const revenues = await prisma.ubosRevenue.findMany();
    const existingTrxIds = new Set(revenues.map(r => r.mayarTrxId));

    // Get missing transactions
    const missingTrx = transactions.filter((t: any) => 
      (t.status === "PAID" || t.status === "SETTLED" || t.status === "SUCCESS") &&
      !existingTrxIds.has(t.id) && 
      !existingTrxIds.has(t.reference) && 
      !existingTrxIds.has(t.invoice_id)
    );

    // Fetch all users
    const users = await prisma.user.findMany();
    
    const results = [];
    let fixedCount = 0;

    for (const trx of missingTrx) {
      const trxName = (trx.customer?.name || trx.name || "").toLowerCase().trim();
      const trxEmail = (trx.customer?.email || trx.email || "").toLowerCase().trim();
      
      let matchedUser = null;

      // 1. Exact Email match (maybe webhook failed for other reasons)
      if (trxEmail) {
        matchedUser = users.find(u => u.email?.toLowerCase() === trxEmail);
      }

      // 2. Name Match (Loose)
      if (!matchedUser && trxName) {
        matchedUser = users.find(u => {
          const uName = (u.name || "").toLowerCase().trim();
          if (!uName) return false;
          // Match if name includes trxName or trxName includes uName (for partials like "Reza" vs "Reza Triansyah")
          return uName.includes(trxName) || trxName.includes(uName);
        });
      }

      if (matchedUser) {
        // Create revenue record for them
        const trxId = trx.id || trx.reference || trx.invoice_id;
        const amount = Number(trx.amount || trx.total || trx.total_amount || 0);
        
        await prisma.ubosRevenue.create({
          data: {
            userId: matchedUser.id,
            mayarTrxId: trxId,
            amount: amount,
            paymentMethod: trx.payment_method || "MAYAR",
            status: "PAID"
          }
        });
        
        fixedCount++;
        results.push({ trxId, matched: matchedUser.name || matchedUser.email, amount });
      } else {
        results.push({ trxId: trx.id, matched: null, name: trxName, email: trxEmail });
      }
    }

    return NextResponse.json({ 
      success: true, 
      missingCount: missingTrx.length, 
      fixedCount, 
      results 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
