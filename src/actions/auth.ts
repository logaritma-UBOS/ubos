"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const rawEmail = formData.get("email") as string
  const password = formData.get("password") as string
  
  if (!name || !rawEmail || !password) return { error: "Semua field wajib diisi" }
  
  const email = rawEmail.trim().toLowerCase()
  
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email sudah terdaftar. Silakan login." }
  
  const passwordHash = await bcrypt.hash(password, 10)
  
  await prisma.user.create({
    data: { name, email, passwordHash, role: "OWNER" }
  })
  
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/onboarding",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registrasi berhasil, tetapi gagal masuk otomatis. Silakan login manual." }
    }
    throw error // Penting untuk alur redirect Next.js
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const rawEmail = formData.get("email") as string
    const email = rawEmail ? rawEmail.trim().toLowerCase() : ""
    
    await signIn("credentials", {
      email,
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

import { resend } from "@/lib/resend"

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const rawEmail = formData.get("email") as string
  if (!rawEmail) return { error: "Email wajib diisi" }
  
  const email = rawEmail.trim().toLowerCase()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Return success to prevent email enumeration attacks
    return { success: "Jika email terdaftar, tautan reset telah dikirim." }
  }

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

  // Check existing token
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email }
  })
  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: existingToken.token
        }
      }
    })
  }

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires
    }
  })

  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://ubos.logaritma.id'}/reset-sandi?token=${token}`

  try {
    const { data, error } = await resend.emails.send({
      from: "UBOS <noreply@ubos.logaritma.id>",
      to: email,
      subject: "Reset Kata Sandi UBOS",
      html: `<p>Klik tautan berikut untuk mengatur ulang kata sandi Anda: <a href='${resetUrl}'>Reset Kata Sandi</a></p><p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>`
    })

    if (error) {
      console.error("Resend API Error:", error)
      return { error: `Gagal mengirim email: ${error.message}` }
    }
  } catch (err) {
    console.error("Resend Try-Catch Error:", err)
    return { error: "Terjadi kesalahan internal saat menghubungi server email." }
  }

  return { success: "Jika email terdaftar, tautan reset telah dikirim." }
}

export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string

  if (!token || !password) return { error: "Tautan tidak valid atau sandi kosong." }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token }
  })

  if (!verificationToken) {
    return { error: "Tautan reset tidak valid atau sudah digunakan." }
  }

  if (new Date(verificationToken.expires) < new Date()) {
    return { error: "Tautan reset telah kedaluwarsa." }
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier }
  })

  if (!user) return { error: "Pengguna tidak ditemukan." }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token
      }
    }
  })

  return { success: "Kata sandi berhasil diubah! Silakan masuk dengan sandi baru Anda." }
}
