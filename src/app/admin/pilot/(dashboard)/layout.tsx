export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import MidnightAutoLogout from "@/components/MidnightAutoLogout";
import ProfileUploader from "@/components/ProfileUploader";
import TeamAgentChat from "@/components/chat/TeamAgentChat";
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
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 px-2">Dashboard Utama</h3>
            <div className="space-y-1">
              {isSuperAdmin ? (
                <>
                  <Link href="/admin/pilot" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Overview Bisnis
                  </Link>
                  <Link href="/admin/pilot/checklist" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Checklist Harian
                  </Link>
                  <Link href="/admin/pilot/ideas" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> Linimasa Tim
                  </Link>
                  <Link href="/admin/pilot/support" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> Live Chat Support
                  </Link>
                  <Link href="/admin/pilot/users" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Manajemen 100 User
                  </Link>
                  <Link href="/admin/pilot/content" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> Konten & Notif
                  </Link>
                  <Link href="/admin/pilot/traffic" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> Traffic Tracker
                  </Link>
                  <Link href="/admin/pilot#monitoring" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> Monitoring Tim
                  </Link>
                  <Link href="/admin/pilot#finance" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Distribusi Finansial
                  </Link>
                </>
              ) : (
                <>
                  <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> Beranda & Profil
                  </Link>
                  <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}/checklist`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Checklist Harian
                  </Link>
                  <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}/tools`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> Area Kerja
                  </Link>
                  <Link href="/admin/pilot/ideas" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110 2 1 1 0 010-2z" /></svg> Linimasa
                  </Link>
                </>
              )}
            </div>
          </div>
                    <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 px-2 mt-6">Sistem & Integrasi</h3>
              <div className="space-y-1">
                <Link href="/admin/pilot/wa-sync" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> Integrasi WA Pribadi
                </Link>
              </div>
            </div>
          </nav>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-3 bg-gray-50 mt-auto">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <ProfileUploader userId={teamMember.id} initialImage={teamMember.profilePicture} name={teamMember.name} size="sm" />
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
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <ProfileUploader userId={teamMember.id} initialImage={teamMember.profilePicture} name={teamMember.name} size="sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Team OS</h1>
              <p className="text-xs text-gray-500">Halo, {teamMember.name}</p>
            </div>
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
        <TeamAgentChat />
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden sticky bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-[68px] z-50 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]">
        {isSuperAdmin ? (
          <>
            <Link href="/admin/pilot" className="flex flex-col items-center justify-center w-[20%] h-full text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[10px] font-bold mt-0.5">Beranda</span>
            </Link>
            <Link href="/admin/pilot/checklist" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Checklist</span>
            </Link>
            
            {/* CENTER BUTTON - AREA KERJA */}
            <div className="relative w-[20%] flex justify-center -mt-7">
              <Link href="/admin/pilot/content" className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/30 border-[3px] border-white active:scale-95 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </Link>
              <span className="text-[10px] font-bold text-emerald-600 absolute -bottom-5">Area Kerja</span>
            </div>
    
            <Link href="/admin/pilot/traffic" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Trafik</span>
            </Link>
            <Link href="/admin/pilot/menu" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Lainnya</span>
            </Link>
          </>
        ) : (
          <>
            {/* SLOT 1 - Beranda */}
            <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}`} className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Beranda</span>
            </Link>

            {/* SLOT 2 - Checklist */}
            <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}/checklist`} className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Checklist</span>
            </Link>

            {/* SLOT 3 - CENTER BUTTON Area Kerja */}
            <div className="relative w-[20%] flex justify-center -mt-7">
              <Link href={`/admin/pilot/${teamMember.role.toLowerCase()}/tools`} className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/30 border-[3px] border-white active:scale-95 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </Link>
              <span className="text-[10px] font-bold text-emerald-600 absolute -bottom-5">Area Kerja</span>
            </div>

            {/* SLOT 4 - Feed Linimasa */}
            <Link href="/admin/pilot/ideas" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110 2 1 1 0 010-2z" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Linimasa</span>
            </Link>

            {/* SLOT 5 - Lainnya */}
            <Link href="/admin/pilot/menu" className="flex flex-col items-center justify-center w-[20%] h-full text-gray-400 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              <span className="text-[10px] font-semibold mt-0.5">Lainnya</span>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

