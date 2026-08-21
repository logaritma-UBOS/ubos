"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  if (!name || !email || !password) return { error: "Semua field wajib diisi" }
  
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email sudah terdaftar. Silakan login." }
  
  const passwordHash = await bcrypt.hash(password, 10)
  
  await prisma.user.create({
    data: { name, email, passwordHash, role: "OWNER" }
  })
  
  redirect("/login")
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." }
        default:
          return { error: "Terjadi kesalahan saat login." }
      }
    }
    throw error // Dibutuhkan agar fitur redirect() Next.js berjalan normal
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" })
}
