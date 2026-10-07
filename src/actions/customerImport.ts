"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function bulkAddCustomers(data: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const business = await prisma.business.findFirst({
      where: { userId: session.user.id }
    })
    if (!business) return { error: "Toko tidak ditemukan" }

    const lines = data.split('\n').map(l => l.trim()).filter(l => l.length > 5)
    let added = 0
    let skipped = 0

    // Fetch existing phones to avoid duplicates
    const existing = await prisma.customer.findMany({
      where: { businessId: business.id },
      select: { phone: true }
    })
    const existingSet = new Set(existing.map(e => e.phone).filter(Boolean))

    for (const line of lines) {
      // Parse format: Name, 08123456
      let name = "Pelanggan"
      let phone = line
      
      if (line.includes(',')) {
        const parts = line.split(',')
        name = parts[0].trim() || "Pelanggan"
        phone = parts[1].trim()
      } else if (line.includes(';')) {
        const parts = line.split(';')
        name = parts[0].trim() || "Pelanggan"
        phone = parts[1].trim()
      } else if (line.includes('\t')) {
        const parts = line.split('\t')
        name = parts[0].trim() || "Pelanggan"
        phone = parts[1].trim()
      }
      
      phone = phone.replace(/[^0-9]/g, '')
      if (phone.length < 9) {
        skipped++
        continue
      }
      
      if (existingSet.has(phone)) {
        skipped++
        continue
      }

      await prisma.customer.create({
        data: {
          businessId: business.id,
          name: name,
          phone: phone,
          email: ""
        }
      })
      added++
      existingSet.add(phone)
    }

    revalidatePath("/pelanggan")
    revalidatePath("/marketing")
    return { success: true, added, skipped }
  } catch (err) {
    console.error(err)
    return { error: "Terjadi kesalahan sistem saat memproses kontak." }
  }
}
