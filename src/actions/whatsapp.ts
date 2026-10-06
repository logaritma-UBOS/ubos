"use server"
import { unstable_noStore as noStore } from 'next/cache';

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const GATEWAY_URL = "http://202.155.94.170:3000"

export async function getWaStatus(timestamp?: number) {
  noStore();
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const business = await prisma.business.findFirst({
      where: { userId: session.user.id }
    })
    if (!business) return { success: false, error: "Business not found" }

    const setting = await prisma.businessSetting.findUnique({
      where: { businessId: business.id }
    })

    // Hit our Private Gateway with the business ID as the session
    const res = await fetch(`${GATEWAY_URL}/status?session=${business.id}&t=${Date.now()}`, { cache: "no-store" })
    const data = await res.json()

    if (data.status === "connected") {
      if (setting?.waStatus !== "CONNECTED") {
        await prisma.businessSetting.upsert({
          where: { businessId: business.id },
          create: { businessId: business.id, waStatus: "CONNECTED" },
          update: { waStatus: "CONNECTED" }
        })
      }
      return { success: true, status: "CONNECTED", device: data.user.id }
    } else if (data.status === "waiting_for_scan") {
      if (setting?.waStatus !== "DISCONNECTED") {
        await prisma.businessSetting.upsert({
          where: { businessId: business.id },
          create: { businessId: business.id, waStatus: "DISCONNECTED" },
          update: { waStatus: "DISCONNECTED" }
        })
      }
      return { success: true, status: "DISCONNECTED", qr: data.qr }
    } else {
      return { success: true, status: "INITIALIZING" }
    }
  } catch (error: any) {
    console.error("WA Status Error:", error)
    return { success: false, error: "Gagal terhubung ke WA Gateway" }
  }
}

export async function disconnectWa() {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const business = await prisma.business.findFirst({
      where: { userId: session.user.id }
    })
    if (!business) return { error: "Business not found" }
    
    try {
      await fetch(`${GATEWAY_URL}/disconnect?session=${business.id}`, { method: "POST" })
    } catch (e) {
      console.error("Gateway disconnect error", e)
    }

    await prisma.businessSetting.update({
      where: { businessId: business.id },
      data: { waStatus: "DISCONNECTED", fonnteToken: null }
    })

    revalidatePath("/pengaturan/whatsapp")
    return { success: true }
  } catch (e) {
    return { error: "Gagal memutuskan koneksi" }
  }
}




