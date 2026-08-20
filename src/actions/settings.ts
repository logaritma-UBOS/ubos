"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateMonthlyTarget(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) throw new Error("Business not found")

  const targetOmzet = parseFloat(formData.get("targetOmzet") as string) || 0

  const existingGoal = await prisma.goal.findFirst({
    where: { businessId: business.id, period: "MONTHLY" }
  })

  if (existingGoal) {
    await prisma.goal.update({
      where: { id: existingGoal.id },
      data: { targetOmzet }
    })
  } else {
    await prisma.goal.create({
      data: {
        businessId: business.id,
        targetOmzet,
        period: "MONTHLY"
      }
    })
  }

  revalidatePath("/")
  redirect("/")
}
