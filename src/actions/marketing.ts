"use server"
import { logPilotActivity } from "@/lib/pilotAudit"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendWaBlastFonnte } from "@/actions/admin"

export async function blastWhatsAppGroup(segment: string, message: string) {
  try {
    const internalEmails = ["logaritma.tim@gmail.com", "tony@logaritma.id", "reza@logaritma.id", "bana@logaritma.id"];
    const allOwners = await prisma.user.findMany({
      where: { 
        role: "OWNER",
        email: { notIn: internalEmails }
      },
      select: { id: true, phone: true }
    });

    const allRevenues = await prisma.ubosRevenue.findMany({
      where: { status: "PAID" },
      select: { userId: true }
    });
    const vipIds = new Set(allRevenues.map(r => r.userId));

    let targets = [];
    if (segment === "VIP") {
      targets = allOwners.filter(u => vipIds.has(u.id));
    } else if (segment === "FREE") {
      targets = allOwners.filter(u => !vipIds.has(u.id));
    } else {
      targets = allOwners;
    }

    // Filter valid phones
    targets = targets.filter(u => u.phone && u.phone.length >= 9);

    if (targets.length === 0) return { error: "Tidak ada target yang memiliki nomor WhatsApp valid." };

    let successCount = 0;
    for (const t of targets) {
      if (t.phone) {
        try {
          await sendWaBlastFonnte(t.phone, message);
          successCount++;
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error("Failed to send to", t.phone);
        }
      }
    }

    await logPilotActivity("Kirim WhatsApp Blast Massal", `Berhasil mengirim ke ${successCount} dari ${targets.length} target Segmen: ${segment}`);
    return { success: true, count: successCount, total: targets.length };
  } catch (error: any) {
    return { error: error.message || "Gagal melakukan blast" };
  }
}

// For Konten
import { uploadImage } from "@/lib/cloudinary"

export async function uploadFeedBanner(formData: FormData) {
  try {
    const file = formData.get("image") as File
    if (!file) throw new Error("No file provided")
    const uploaded = await uploadImage(file)
    if (!uploaded) throw new Error("Upload failed")
    return { success: true, url: uploaded.secure_url }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getFeedContents(audience?: string) {
  const where = audience ? { audience } : {};
  return prisma.ubosFeedContent.findMany({ where, orderBy: { createdAt: 'desc' } })
}

export async function createFeedContent(data: { title: string, content: string, category: string, status: string, audience?: string, imageUrl?: string | null }) {
  try {
    await logPilotActivity("Buat Konten", `Menambahkan konten feed baru berjudul: ${data.title}`);
    await prisma.ubosFeedContent.create({
      data: {
        ...data,
        author: "Pilot Admin",
        audience: data.audience || "ALL",
        imageUrl: data.imageUrl || null
      }
    });
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateFeedContent(id: string, data: { title: string, content: string, category: string, audience?: string, imageUrl?: string | null }) {
  try {
    await logPilotActivity("Edit Konten", `Mengubah konten feed: ${data.title}`);
    await prisma.ubosFeedContent.update({
      where: { id },
      data: {
        ...data,
        audience: data.audience || "ALL",
        imageUrl: data.imageUrl || null
      }
    });
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteFeedContent(id: string) {
  try {
    await prisma.ubosFeedContent.delete({ where: { id } });
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// For Promo
export async function getOwnerOffers() {
  return prisma.ownerOffer.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createOwnerOffer(data: { name: string, targetSegment: string, cta: string, status: string }) {
  try {
    await logPilotActivity("Buat Promo Baru", `Menambahkan promo baru: ${data.name} untuk segmen ${data.targetSegment}`);
    await prisma.ownerOffer.create({ data });
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteOwnerOffer(id: string) {
  try {
    await prisma.ownerOffer.delete({ where: { id } });
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}


// For Social Media Calendar
export async function getSosmedPlans(author: string) {
  return prisma.ownerCampaign.findMany({ 
    where: { objective: 'SOCIAL_MEDIA', author }, 
    orderBy: { startAt: 'asc' } 
  });
}

export async function getSosmedFeed() {
  return prisma.ownerCampaign.findMany({ 
    where: { objective: 'SOCIAL_MEDIA', status: 'SELESAI' }, 
    orderBy: { startAt: 'desc' } 
  });
}

export async function createSosmedPlan(data: { name: string, channel: string, message: string, startAt: Date, status: string, driveUrl?: string, postUrl?: string }) {
  try {
    const session = await auth();
    const pilotName = session?.user?.name || "Pilot Admin";

    // SIMPAN DULU ke DB — log aktivitas tidak boleh menghalangi ini
    await prisma.ownerCampaign.create({
      data: {
        ...data,
        objective: 'SOCIAL_MEDIA',
        targetSegment: 'PUBLIC',
        author: pilotName
      }
    });

    // Log aktivitas secara terpisah — jika gagal, data tetap tersimpan
    try {
      await logPilotActivity("Buat Kalender Sosmed", `Menjadwalkan postingan ${data.channel}: ${data.name}`);
    } catch (_logErr) {
      // Sengaja diabaikan — log gagal tidak membatalkan simpan
    }

    revalidatePath('/admin/pilot/kalender-konten');
    revalidatePath('/admin/pilot/sosmed-feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteSosmedPlan(id: string) {
  try {
    await prisma.ownerCampaign.delete({ where: { id } });
    revalidatePath('/admin/pilot/kalender-konten');
    revalidatePath('/admin/pilot/sosmed-feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}


export async function logManualBlastAudit(count: number, total: number) { await logPilotActivity('Kirim Manual WhatsApp Blast (CSV/Input)', `Berhasil mengirim ke ${count} dari ${total} nomor target eksternal.`); }

export async function editSosmedPlan(id: string, data: { name: string, channel: string, message: string, startAt: Date, status: string, driveUrl?: string, postUrl?: string }) {
  try {
    // SIMPAN DULU ke DB
    await prisma.ownerCampaign.update({
      where: { id },
      data
    });

    // Log terpisah — tidak menghalangi simpan
    try {
      await logPilotActivity("Edit Kalender Sosmed", `Mengubah postingan ${data.channel}: ${data.name}`);
    } catch (_logErr) {
      // Sengaja diabaikan
    }

    revalidatePath('/admin/pilot/kalender-konten');
    revalidatePath('/admin/pilot/sosmed-feed');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
