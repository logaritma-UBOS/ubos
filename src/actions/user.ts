"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"

export async function updateUserImage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const file = formData.get("image") as File
  if (!file) throw new Error("No file provided")

  const uploaded = await uploadImage(file)
  if (!uploaded) throw new Error("Gagal upload ke Cloudinary")

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: uploaded.secure_url }
  })

  revalidatePath("/")
  return { success: true, imageUrl: uploaded.secure_url }
}
