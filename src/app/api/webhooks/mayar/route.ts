import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const WEBHOOK_TOKEN = process.env.MAYAR_WEBHOOK_TOKEN || "bb7e784b44159a06cc9bd3b9bc8e589578ad89fe117e742da1af7424b5274c75642d07e3a654452ba19deb8b54c783f8302bf028cfef9a9e467c63c74d45171a";

    // Simple auth check
    if (authHeader !== `Bearer ${WEBHOOK_TOKEN}` && authHeader !== WEBHOOK_TOKEN) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawPayload = await req.json();
    console.log("Mayar Webhook Received:", JSON.stringify(rawPayload));

    // Tolak event "testing" dari Mayar, cukup balas received:true
    if (rawPayload.event === "testing") {
      console.log("Mayar Test Webhook - OK");
      return NextResponse.json({ received: true });
    }

    const payload = rawPayload.data || rawPayload;
    
    const paymentStatus = (payload.status || "").toUpperCase();

    if (paymentStatus === "PAID" || paymentStatus === "SETTLED" || paymentStatus === "SUCCESS") {
       // FIX: Mayar mengirim email di berbagai field tergantung tipe event:
       // - invoice/payment: payload.customer.email
       // - membership: payload.customerEmail
       // - fallback: payload.email
       const email = (
         payload.customer?.email ||
         payload.customerEmail ||
         payload.email ||
         ""
       ).toLowerCase().trim();

       console.log("Mayar Webhook - Email parsed:", email);

       const explicitUserId = payload.reference || (payload.metadata && payload.metadata.userId);

       if (email || explicitUserId) {
          let user = null;

          if (explicitUserId) {
            user = await prisma.user.findUnique({ where: { id: explicitUserId } });
            console.log("Mayar Webhook - User found via reference/metadata:", explicitUserId);
          }

          if (!user && email) {
            // SQLite tidak support mode: 'insensitive' di Prisma
            // Jadi kita cari exact match dulu, kalau gagal, cari manual
            user = await prisma.user.findFirst({
              where: { email: email }
            });

            if (!user) {
               const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
               const matched = allUsers.find(u => u.email?.toLowerCase() === email);
               if (matched) {
                  user = await prisma.user.findUnique({ where: { id: matched.id } });
               }
            }
          }

          console.log("Mayar Webhook - User found:", user ? user.id : "NOT FOUND");

          if (user) {
             const trxId = payload.id || payload.trx_id || payload.reference || Date.now().toString();
             // Prioritaskan net_amount (nominal bersih setelah dipotong fee Mayar/Channel)
             // agar 100% sinkron dengan saldo riil di dashboard Mayar.
             const existingRev = await prisma.ubosRevenue.findUnique({ where: { mayarTrxId: trxId } });
             const amount = Number(payload.net_amount || payload.amount || payload.total || payload.total_amount || 0);

             // Deteksi nama paket untuk membedakan Pro Bulanan dan Pro Tahunan
             const productDesc = (payload.description || payload.productName || payload.name || "").toUpperCase();
             const isTahunan = productDesc.includes("TAHUNAN") || productDesc.includes("YEARLY");
             
             // Kita simpan flag TAHUNAN di paymentMethod karena field ini string dan bisa dipakai untuk flag
             const defaultMethod = payload.payment_method || "MAYAR";
             const methodToSave = isTahunan ? `PRO_TAHUNAN_${defaultMethod}` : `PRO_BULANAN_${defaultMethod}`;

             await prisma.ubosRevenue.upsert({
               where: { mayarTrxId: trxId },
               create: {
                 userId: user.id,
                 mayarTrxId: trxId,
                 amount: amount,
                 paymentMethod: methodToSave,
                 status: "PAID"
               },
               update: {
                 status: "PAID",
                 paymentMethod: methodToSave, // Timpa method jika upgrade
                 amount: amount > 0 ? amount : undefined
               }
             });
             
             console.log("Mayar Webhook - Revenue upserted for trxId:", trxId);

             if (!existingRev && amount > 0) {
               // FASE 5: FINTECH AUTO-SPLIT PAYROLL
               const netProfit = amount;
               const reserveAmount = netProfit * 0.2;
               const poolAmount = netProfit * 0.8;
               
               await prisma.$transaction(async (tx) => {
                 // 1. Catat ke Ledger Kas Cadangan
                 await tx.teamLedger.create({
                   data: {
                     type: "RESERVE_ALLOCATION",
                     amount: reserveAmount,
                     description: `Otomatis (Mayar) - Alokasi 20% dari Trx ${trxId}`
                   }
                 });

                 // 2. Bagi ke anggota
                 const members = await tx.teamMember.findMany();
                 for (const m of members) {
                   const share = (m.sharePercentage / 100) * poolAmount;
                   
                   await tx.teamMember.update({
                     where: { id: m.id },
                     data: {
                       walletBalance: { increment: share },
                       totalEarned: { increment: share }
                     }
                   });
           
                   await tx.teamLedger.create({
                     data: {
                       teamMemberId: m.id,
                       type: "ROYALTY",
                       amount: share,
                       description: `Otomatis (Mayar) - Royalti ${m.sharePercentage}% dari Trx ${trxId}`
                     }
                   });
                 }
               });
             }
          } else {
            console.log("Mayar Webhook - User NOT FOUND for email:", email);
          }
       } else {
         console.log("Mayar Webhook - No email found in payload");
       }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Mayar Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
