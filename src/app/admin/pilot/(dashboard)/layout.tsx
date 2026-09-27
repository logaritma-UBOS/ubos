import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import MidnightAutoLogout from "@/components/MidnightAutoLogout";
import { prisma } from "@/lib/prisma";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team OS - UBOS Pilot",
  manifest: "/api/manifest-pilot",
  appleWebApp: {
    title: "Team OS",
    statusBarStyle: "default",
  },
};

export default async function PilotLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/pilot/login");
  }

  const teamMember = await prisma.teamMember.findUnique({
    where: { email: session.user.email }
  });

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <MidnightAutoLogout />
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Akses Ditolak</h1>
          <p className="text-slate-600 mb-8 text-sm">
            Area operasional internal Team OS. Akun <strong className="text-slate-800">{session.user.email}</strong> tidak memiliki otoritas.
          </p>
          <div className="flex flex-col gap-3">
             <Link href="/" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200">
               Kembali ke Beranda
             </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = teamMember.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
      <MidnightAutoLogout />
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0 h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <Link href="/admin/pilot" className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </span>
            Team OS
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 px-2">Dashboard Role</h3>
            <div className="space-y-1">
              {isSuperAdmin && (
                <Link href="/admin/pilot" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">Master Admin</Link>
              )}
              {(isSuperAdmin || teamMember.role === "METHODOLOGY") && (
                <Link href="/admin/pilot/methodology" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50">Methodology (Tony)</Link>
              )}
              {(isSuperAdmin || teamMember.role === "DEVELOPER") && (
                <Link href="/admin/pilot/developer" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-amber-600 hover:bg-amber-50">Developer (Reza)</Link>
              )}
              {(isSuperAdmin || teamMember.role === "OPERATIONS") && (
                <Link href="/admin/pilot/operations" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50">Operations (Bana)</Link>
              )}
            </div>
          </div>
        </nav>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-3 bg-gray-50 mt-auto">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {teamMember.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-[10px] font-semibold text-slate-400">{teamMember.role}</p>
              <p className="text-xs font-bold text-slate-800 truncate">{teamMember.name}</p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/pilot/login" });
          }}>
            <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
          </form>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 relative pb-[80px] lg:pb-0" suppressHydrationWarning>
        
        {/* Wallet Widget Header (Rendered on Server) */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team OS</h1>
            <p className="text-xs text-gray-500">Halo, {teamMember.name}</p>
          </div>
          <div className="bg-slate-900 text-white rounded-xl px-4 py-2 flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Saldo Dompet</p>
              <p className="text-sm font-bold text-emerald-400">Rp {teamMember.walletBalance.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[68px] z-50">
        <Link href={`/admin/pilot/${teamMember.role === "SUPER_ADMIN" ? "" : teamMember.role.toLowerCase()}`} className="flex flex-col items-center justify-center w-full h-full text-blue-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[10px] font-bold mt-0.5">Dashboard Saya</span>
        </Link>
      </div>
    </div>
  )
}