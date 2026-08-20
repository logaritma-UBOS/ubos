"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createBusiness(prevState: any, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const businessType = formData.get("businessType") as string
  const operatingDays = parseInt(formData.get("operatingDays") as string) || 7
  const targetOmzet = parseFloat(formData.get("targetOmzet") as string) || 0
  
  const productName = formData.get("productName") as string
  const sellPrice = parseFloat(formData.get("sellPrice") as string) || 0

  if (!name || !businessType) return { error: "Nama dan Jenis Usaha wajib diisi" }

  await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        userId: session.user.id,
        name,
        businessType,
        operatingDays,
        settings: {
          create: { baseCurrency: "IDR" }
        },
        goals: {
          create: {
            targetOmzet,
            period: "MONTHLY"
          }
        }
      }
    })

    if (productName && sellPrice) {
      await tx.product.create({
        data: {
          businessId: business.id,
          name: productName,
          sellPrice
        }
      })
    }
  })

  redirect("/")
}
