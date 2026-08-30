import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminMenuPage() {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24 lg:hidden">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Menu Lainnya</h1>
      
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

      <div className="space-y-3">
        <Link href="/admin/pilot/feedback" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.436 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
          </div>
          <span className="font-bold text-gray-700">Masukan / Saran</span>
        </Link>
        <Link href="/admin/pilot/feed" className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <span className="font-bold text-gray-700">Konten Feed Premium</span>
        </Link>
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/pilot/login" });
        }}>
          <button type="submit" className="w-full flex items-center gap-4 bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            </div>
            <span className="font-bold text-red-600">Keluar (Logout)</span>
          </button>
        </form>
      </div>
    </div>
  );
}