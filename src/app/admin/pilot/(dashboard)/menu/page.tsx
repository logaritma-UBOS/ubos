import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileUploader from "@/components/ProfileUploader";
export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await auth();
  const teamMember = session?.user?.email
    ? await prisma.teamMember.findUnique({ where: { email: session.user.email } })
    : null;

  const isSuperAdmin = teamMember?.role === "SUPER_ADMIN";
  const role = teamMember?.role?.toLowerCase() ?? "";

  return (
    <div className="min-h-screen bg-[#fcfaf2] p-4 pb-24 lg:hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-900">Menu Lainnya</h1>
      </div>

      {/* Profil */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        {teamMember
          ? <ProfileUploader userId={teamMember.id} initialImage={teamMember.profilePicture} name={teamMember.name} size="lg" />
          : <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">{session?.user?.name?.charAt(0) || "U"}</div>
        }
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-slate-800 truncate">{session?.user?.name || "Admin UBOS"}</p>
          <p className="text-xs text-slate-500 truncate">{session?.user?.email || "admin@ubos"}</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* MENU SUPER_ADMIN */}
        {isSuperAdmin && (
          <div>
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Sistem Dashboard</h2>
            <div className="space-y-2 grid grid-cols-1 gap-2">

              <Link href="/admin/pilot/ideas" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Linimasa Tim</span>
              </Link>

              <Link href="/admin/pilot/support" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Live Chat Support</span>
              </Link>

              <Link href="/admin/pilot/users" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Manajemen User</span>
              </Link>

              <Link href="/admin/pilot/konten" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Konten &amp; Notif</span>
              </Link>

              <Link href="/admin/pilot/traffic" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Traffic Tracker</span>
              </Link>

              <Link href="/admin/pilot/monitoring" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Monitoring Tim</span>
              </Link>

              <Link href="/admin/pilot/finance" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Distribusi Finansial</span>
              </Link>

            </div>
          </div>
        )}

        {/* MENU TIM (non-SUPER_ADMIN) */}
        {!isSuperAdmin && role && (
          <div>
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Menu Tim</h2>
            <div className="space-y-2 grid grid-cols-1 gap-2">

              <Link href={`/admin/pilot/${role}/tools`} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Area Kerja</span>
              </Link>

              <Link href={`/admin/pilot/${role}/checklist`} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Checklist Harian</span>
              </Link>

              <Link href="/admin/pilot/ideas" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110 2 1 1 0 010-2z" /></svg>
                </div>
                <span className="font-bold text-gray-700 text-sm">Linimasa</span>
              </Link>

            </div>
          </div>
        )}

                  <div className="pt-2 pb-2">
            <Link href="/admin/pilot/wa-sync" className="w-full flex items-center gap-4 bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <span className="font-bold text-emerald-700 text-sm">Integrasi WhatsApp Pribadi</span>
            </Link>
          </div>
          {/* LOGOUT */}
        <div className="pt-2">
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/pilot/login" });
          }}>
            <button type="submit" className="w-full flex items-center gap-4 bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              </div>
              <span className="font-bold text-red-600 text-sm">Keluar (Logout)</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

