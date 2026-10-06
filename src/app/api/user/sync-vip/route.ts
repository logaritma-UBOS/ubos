import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NzExZTAxZi01ZjI4LTQ3MDgtYTc1Yy1iODE2ZjczZjM3YmQiLCJhY2NvdW50SWQiOiJjMTQyNmNkNi1lNTJiLTRmNzktYjlhNS1iMGY4ZmRjMjc2YzMiLCJjcmVhdGVkQXQiOiIxNzg4MDcwMjg2MDAxIiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoibG9nYXJpdG1hLnRpbUBnbWFpbC5jb20iLCJuYW1lIjoiTG9nYXJpdG1hIiwibGluayI6ImxvZ2FyaXRtYS1wYXkiLCJpc1NlbGZEb21haW4iOmZhbHNlLCJpYXQiOjE3ODgwNzAyODZ9.i-0x6ok50c2ys7PpkbAEuLESGZHZ6glNpe-OjHnbnnXHjEAYgn2SkrhRxBUcWvDQvOaV8uIs9wo7La4aM0KtDcoHfbiH7jEtrSgEqLPG_50ZbUbhFN-alCT-_CUOUXMhbEbD3Xrh3L-QHOmwwI74-AqhUwius0d762VvF6tfQG8CHvabcn1GJHuYTikAAiKWNpiILDoyReoF2jcGn_vN4zrEoVb8Ma0oed2kBxYZRnEGytnDn45rrMt3TfP96hWBCcQZZO3Yo4UZfbSyiYem3QmT2iNTRw4quUONdcF73Hy7acaUqunIioy52p6PC3gHJVx1eKxsAbzalRZbYjKDLw";
    
    // Cukup scan 1 halaman pertama untuk mendapatkan transaksi terbaru user ini
    const res = await fetch("https://api.mayar.id/hl/v1/invoice?page=1", {
      headers: { "Authorization": `Bearer ${MAYAR_API_KEY}` }
    });
    const data = await res.json();
    
    let fixed = 0;
    if (data.data) {
      const userInvoices = data.data.filter((t: any) => {
        const status = (t.status || "").toUpperCase();
        const isSuccess = status === "PAID" || status === "SETTLED" || status === "SUCCESS";
        // Filter by reference (userId) or email
        return isSuccess && (t.reference === session.user?.id || t.customer?.email === session.user?.email || t.email === session.user?.email);
      });

      for (const trx of userInvoices) {
        const trxId = trx.id || trx.reference || trx.invoice_id;
        const existing = await prisma.ubosRevenue.findUnique({ where: { mayarTrxId: trxId } });
        
        if (!existing && session.user?.id) {
          const amount = Number(trx.amount || trx.total || trx.total_amount || 0);
          const productDesc = (trx.description || trx.productName || trx.name || "").toUpperCase();
          const isTahunan = productDesc.includes("TAHUNAN") || productDesc.includes("YEARLY");
          const defaultMethod = trx.payment_method || "MAYAR";
          const methodToSave = isTahunan ? `PRO_TAHUNAN_${defaultMethod}` : `PRO_BULANAN_${defaultMethod}`;

          await prisma.ubosRevenue.create({
            data: {
              userId: session.user.id,
              mayarTrxId: trxId,
              amount: amount,
              paymentMethod: methodToSave,
              status: "PAID"
            }
          });
          fixed++;
        }
      }
    }
    
    return NextResponse.json({ success: true, fixed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
