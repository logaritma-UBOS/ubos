"use client"

import { registerUser } from "@/actions/auth"
import Link from "next/link"
import { useActionState } from "react"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerUser, null)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-5 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl leading-none shadow-md shadow-emerald-500/30">U</div>
          <span className="text-xl font-black text-emerald-900 tracking-tight">UBOS</span>
        </Link>

        {/* Headline */}
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Mulai Gunakan UBOS
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-xs mx-auto">
          Bangun sistem keputusan bisnis UMKM Anda dari target sampai tindakan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form className="space-y-5" action={action}>

            {/* Error */}
            {state?.error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">
                {state.error}
              </div>
            )}

            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nama Pemilik
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Nama lengkap Anda"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="contoh@email.com"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50"
              />
            </div>

            {/* Submit */}
            <button
              disabled={pending}
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-base font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all mt-2"
            >
              {pending ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
