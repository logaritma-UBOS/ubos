import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenu?: string
  logoutAction?: () => void
}

export default function AdminLayout({ children, activeMenu = "control", logoutAction }: AdminLayoutProps) {
  const controlItems = [
    { id: "control", label: "Beranda", href: "/admin/pilot", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg> },
  ];

  const growthItems = [
    { id: "users", label: "Traffic", href: "/admin/pilot/users", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "activation", label: "Conversion", href: "/admin/pilot/activation", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
    { id: "retention", label: "Relationship", href: "/admin/pilot/retention", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> },
    { id: "monetization", label: "Revenue", href: "/admin/pilot/monetization", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  const actionItems = [
    { id: "actions", label: "Masalah", href: "/admin/pilot/actions", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "campaigns", label: "Kampanye", href: "/admin/pilot/campaigns", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg> },
    { id: "notifications", label: "Notifikasi", href: "/admin/pilot/notifications", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" /></svg> },
  ];

  const resultItems = [
    { id: "results", label: "Hasil & Pembelajaran", href: "/admin/pilot/results", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.154 5.073c.114.506-.442.911-.885.618l-4.71-3.07a.563.563 0 00-.608 0l-4.71 3.07c-.443.293-1-.112-.885-.618l1.154-5.073a.563.563 0 00-1.81-.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
  ];

  const systemItems = [
    { id: "system", label: "Pengaturan", href: "/admin/pilot/system", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
  ];

  const renderNavGroup = (title: string, items: typeof controlItems) => (
    <div className="mb-6">
      <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      {items.map(item => {
        const isActive = activeMenu === item.id;
        return (
          <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
            {item.icon} {item.label}
          </Link>
        )
      })}
    </div>
  )

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

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          {renderNavGroup("CONTROL", controlItems)}
          {renderNavGroup("PERTUMBUHAN", growthItems)}
          {renderNavGroup("TINDAKAN", actionItems)}
          {renderNavGroup("HASIL", resultItems)}
          {renderNavGroup("SISTEM", systemItems)}
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
              value={activeMenu}
            >
              <option value="/admin/pilot">Beranda</option>
              <option value="/admin/pilot/users">Traffic</option>
              <option value="/admin/pilot/activation">Conversion</option>
              <option value="/admin/pilot/retention">Relationship</option>
              <option value="/admin/pilot/monetization">Revenue</option>
              <option value="/admin/pilot/actions">Masalah</option>
              <option value="/admin/pilot/campaigns">Kampanye</option>
              <option value="/admin/pilot/notifications">Notifikasi</option>
              <option value="/admin/pilot/results">Hasil</option>
              <option value="/admin/pilot/system">Pengaturan</option>
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

        {children}
      </main>
    </div>
  )
}
