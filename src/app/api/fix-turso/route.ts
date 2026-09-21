import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const allDonors = [
      { name: "Moh Rosadi", email: "rosadimarunda@gmail.com", amount: 25000 },
      { name: "Erwin Syaripudin", email: "erwinsyaripudin429@gmail.com", amount: 25000 },
      { name: "Iis", email: "iisyuarsih654@gmail.com", amount: 10000 },
      { name: "Taufik Irwan Syarifudin", email: "taufikirwans77@gmail.com", amount: 10000 },
      { name: "Hartini", email: "tini07104@gmail.com", amount: 10000 },
      { name: "Maesaroh", email: "cemae151287@gmail.com", amount: 10000 },
      { name: "Napiah", email: "napiahshenap@gmail.com", amount: 10000 },
      { name: "Neneng Kurniawati", email: "nengnia2409@gmail.com", amount: 25000 },
      { name: "Rosidah", email: "iyosrosidah59@gmail.com", amount: 25000 },
      { name: "ARF Food", email: "aisyahrahmahfadhilah@gmail.com", amount: 10000 },
      { name: "Sutara", email: "sutatadjana@gmail.com", amount: 10000 },
      { name: "Dwi diana", email: "dwidianasari55@gmail.com", amount: 10000 },
      { name: "Suryadarma", email: "suryadarmaa080@gmail.com", amount: 25000 },
      { name: "cut juli parmianti", email: "parmianticutjuli@gmail.com", amount: 10000 },
      { name: "Aisyah Nur Rahmawita", email: "nuraisyah.nr77@gmail.com", amount: 25000 },
      { name: "Sri Widiana", email: "sabrinanne68@gmail.com", amount: 25000 },
      { name: "Nany Kurniasari K", email: "naifimut04@gmail.com", amount: 25000 },
      { name: "ERIKA AGUSTINI", email: "erikaagustini84@gmail.com", amount: 10000 },
      { name: "Reza Triansyah", email: "reza0809@gmail.com", amount: 50000 },
      { name: "Prita Ambarsari,SE", email: "prita.ambarsari99@gmail.com", amount: 10000 },
      { name: "Yeni Nurhayati", email: "thinkncreative74@gmail.com", amount: 10000 },
      { name: "Maryana", email: "nhanhamishilla@gmail.com", amount: 10000 },
      { name: "Fadly", email: "jubaharfadly@gmail.com", amount: 25000 },
      { name: "Qurrata Aini", email: "qurrataaini541@gmail.com", amount: 10000 },
      { name: "warunk arsi", email: "warunkarsi23@gmail.com", amount: 10000 },
      { name: "Baim", email: "logaritma.tim@gmail.com", amount: 10000 },
      { name: "Tony Heryanto", email: "bintangtory08@gmail.com", amount: 100000 }
    ];

    const results = [];
    for (const u of allDonors) {
      // EXACT email match now that we have the Excel sheet
      let user = await prisma.user.findFirst({ where: { email: u.email } });
      
      let action = "";
      if (!user) {
        // Create the user if they don't exist
        user = await prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            role: "OWNER"
          }
        });
        action = "user_created";
      } else {
        action = "user_found";
      }

      // Ensure UbosRevenue exists
      const existingRev = await prisma.ubosRevenue.findFirst({ where: { userId: user.id } });
      if (existingRev) {
        await prisma.ubosRevenue.update({
          where: { id: existingRev.id },
          data: { amount: u.amount }
        });
        action += " + rev_updated";
      } else {
        await prisma.ubosRevenue.create({
          data: {
            userId: user.id,
            mayarTrxId: "manual_sync_excel_" + Date.now() + "_" + Math.floor(Math.random()*1000),
            amount: u.amount,
            paymentMethod: "MAYAR",
            status: "PAID"
          }
        });
        action += " + rev_created";
      }
      
      results.push({ email: u.email, action });
    }
    
    return NextResponse.json({ success: true, count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}

