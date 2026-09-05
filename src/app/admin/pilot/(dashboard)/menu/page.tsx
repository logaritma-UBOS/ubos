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

      <div className="space-y-6">
        {/* SECTION: RAWAT */}
        <div>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Rawat</h2>
          <div className="space-y-2">
            <Link href="/admin/pilot/feedback" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.436 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Masukan / Saran</span>
            </Link>
            <Link href="/admin/pilot/feed" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Konten Feed Premium</span>
            </Link>
          </div>
        </div>

        {/* SECTION: TUMBUH */}
        <div>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Tumbuh</h2>
          <div className="space-y-2">
            <Link href="/admin/pilot/promo" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Promo</span>
            </Link>
            <Link href="/admin/pilot/marketing" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-3.102-.069m0-10.44c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-.657-.38c-.551-.318-1.26-.117-1.527.461a20.845 20.845 0 00-1.44 4.282m3.102-.069a18.03 18.03 0 00-3.102.069" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Marketing</span>
            </Link>
            <Link href="/admin/pilot/konten" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Konten In-App</span>
            </Link>
            <Link href="/admin/pilot/kalender-konten" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Kalender Konten</span>
            </Link>
            <Link href="/admin/pilot/sosmed-feed" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Feed Sosmed</span>
            </Link>
          </div>
        </div>

        {/* SECTION: PERFORMA */}
        <div>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-2">Performa</h2>
          <div className="space-y-2">
            <Link href="/admin/pilot/performa-tim" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Performa Tim</span>
            </Link>
            <Link href="/admin/pilot/performa-trafik" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Performa Trafik</span>
            </Link>
            <Link href="/admin/pilot/performa-konversi" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Performa Konversi</span>
            </Link>
            <Link href="/admin/pilot/performa-relationship" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </div>
              <span className="font-bold text-gray-700 text-sm">Performa Relationship</span>
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