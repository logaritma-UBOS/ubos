import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminMenuPage() {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-[#fcfaf2] p-4 pb-24 lg:hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Menu Lainnya</h1>
        </div>
      </div>
      
      {/* Profil */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-slate-800 truncate">{session?.user?.name || "Admin UBOS"}</p>
          <p className="text-xs text-slate-500 truncate">{session?.user?.email || "admin@ubos"}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* SECTION: SISTEM */}
        <div>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Sistem Dashboard</h2>
          <div className="space-y-2">
            <Link href="/admin/pilot#monitoring" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Monitoring Tim</span>
            </Link>
            <Link href="/admin/pilot#finance" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Distribusi Finansial</span>
            </Link>
          </div>
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
