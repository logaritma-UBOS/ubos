
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createManualLead(name: string, phone: string) {
  if (!name || !phone) return { error: "Nama dan WhatsApp wajib diisi" };
  
  // Format phone number to start with 62
  let formattedPhone = phone.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.substring(1);
  }

  // Generate fake email to satisfy DB unique constraint
  const fakeEmail = `WA-${formattedPhone}@manual.ubos.id`;

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: fakeEmail }, { phone: formattedPhone }] }
    });
    if (existing) return { error: "Nomor WA ini sudah terdaftar di sistem" };

    await prisma.user.create({
      data: {
        name,
        email: fakeEmail,
        phone: formattedPhone,
        role: "LEAD",
        crmStatus: "NEW", // NEW lead
      }
    });

    revalidatePath("/admin/pilot/operations");
    revalidatePath("/admin/pilot/users");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

