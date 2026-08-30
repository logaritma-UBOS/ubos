"use client";
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenu?: string
  logoutAction?: () => void
}

import FreemiumNagScreen from "@/components/layout/FreemiumNagScreen";\nexport default function AdminLayout({ children, activeMenu = "overview", logoutAction }: AdminLayoutProps) {
  const menuItems = [
    { id: "overview", label: "Overview", href: "/admin/pilot", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg> },
    { id: "leads", label: "Peluang", href: "/admin/pilot/leads", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "users", label: "Pelanggan", href: "/admin/pilot/users", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "monetization", label: "Penjualan", href: "/admin/pilot/monetization", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "product", label: "Produk", href: "/admin/pilot/product", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { id: "campaigns", label: "Marketing", href: "/admin/pilot/campaigns", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg> },
    { id: "actions", label: "Aksi", href: "/admin/pilot/actions", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "results", label: "Hasil", href: "/admin/pilot/results", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.154 5.073c.114.506-.442.911-.885.618l-4.71-3.07a.563.563 0 00-.608 0l-4.71 3.07c-.443.293-1-.112-.885-.618l1.154-5.073a.563.563 0 00-1.81-.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-300 font-sans">
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 flex-shrink-0">
          <Link href="/admin/pilot" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-lg">U</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">OWNER<span className="text-blue-500">CENTER</span></h1>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-1">
          {menuItems.map(item => {
            const isActive = activeMenu === item.id || (activeMenu === 'control' && item.id === 'overview');
            return (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
                {item.icon} {item.label}
              </Link>
            )
          })}
        </nav>

        {logoutAction && (
          <div className="p-4 border-t border-slate-800 mt-auto">
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl text-sm font-bold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
              </button>
            </form>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0 bg-slate-50 text-slate-900 relative">
        <div className="md:hidden bg-slate-900 p-4 sticky top-0 z-50 border-b border-slate-800 flex justify-between items-center">
          <Link href="/admin/pilot" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-black text-xs">U</span>
            </div>
            <h1 className="text-sm font-black text-white tracking-tight">OWNER<span className="text-blue-500">CENTER</span></h1>
          </Link>
          <div className="flex gap-2">
            <select 
              className="bg-slate-800 text-slate-300 text-xs rounded px-2 py-1 border-none outline-none"
              onChange={(e) => {
                if(e.target.value) window.location.href = e.target.value;
              }}
              value={menuItems.find(i => activeMenu === i.id || (activeMenu === 'control' && i.id === 'overview'))?.href || "/admin/pilot"}
            >
              {menuItems.map(item => (
                <option key={item.id} value={item.href}>{item.label}</option>
              ))}
            </select>
            {logoutAction && (
              <form action={logoutAction}>
                <button type="submit" className="p-1 bg-slate-800 text-slate-400 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                </button>
              </form>
            )}
          </div>
        </div>

        {children}\n      <FreemiumNagScreen />
      </main>
    </div>
  )
}
