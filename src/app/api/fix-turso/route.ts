import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const allDonors = [
      { email: "iisyuarsih", amount: 10000 },
      { email: "taufikirwans77", amount: 10000 },
      { email: "tini07104", amount: 10000 },
      { email: "cemae151", amount: 10000 },
      { email: "napiahshe", amount: 10000 },
      { email: "nengnia2409", amount: 25000 },
      { email: "iyosrosida", amount: 25000 },
      { email: "aisyahrah", amount: 10000 },
      { email: "sutatadjan", amount: 10000 },
      { email: "dwidianas", amount: 10000 },
      { email: "suryadarmaa080", amount: 25000 },
      { email: "suryadarma889", amount: 25000 },
      { email: "parmianticutjuli", amount: 10000 },
      { email: "nuraisyah.nr77", amount: 25000 },
      { email: "sabrinann23", amount: 25000 },
      { email: "naifimut059", amount: 25000 },
      { email: "reza0809", amount: 50000 },
      { email: "jubaharfadly", amount: 25000 },
      { email: "bintangtory08", amount: 100000 },
      { email: "mhariyadisaputra20", amount: 25000 },
      { email: "rosadimanansite", amount: 25000 },
      { email: "erikaagustini84", amount: 10000 },
      { email: "prita.ambarsari", amount: 10000 },
      { email: "thinkncreative74", amount: 10000 },
      { email: "nhanhamiana", amount: 10000 },
      { email: "qurrataaini047", amount: 10000 },
      { email: "warunkarsi23", amount: 10000 },
      { email: "logaritma.tim", amount: 10000 }
    ];

    const results = [];
    for (const u of allDonors) {
      const user = await prisma.user.findFirst({ where: { email: { contains: u.email } } });
      if (user) {
        const existing = await prisma.ubosRevenue.findFirst({ where: { userId: user.id } });
        if (existing) {
          await prisma.ubosRevenue.update({
            where: { id: existing.id },
            data: { amount: u.amount }
          });
          results.push({ email: u.email, action: "updated" });
        } else {
          await prisma.ubosRevenue.create({
            data: {
              userId: user.id,
              mayarTrxId: "manual_sync_" + Date.now() + "_" + Math.floor(Math.random()*1000),
              amount: u.amount,
              paymentMethod: "MAYAR",
              status: "PAID"
            }
          });
          results.push({ email: u.email, action: "created" });
        }
      } else {
        results.push({ email: u.email, action: "not_found" });
      }
    }
    
    return NextResponse.json({ success: true, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

