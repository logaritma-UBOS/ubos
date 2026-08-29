import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenu?: string
  logoutAction?: () => void
}

export default function AdminLayout({ children, activeMenu = "control", logoutAction }: AdminLayoutProps) {
  const navItems = [
    { id: "control", label: "Control Center", href: "/admin/pilot", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
    { id: "system", label: "System Health", href: "/admin/pilot/system", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 9v2m0 4h.01" /></svg> },
    
    { id: "users", label: "User Intelligence", href: "/admin/pilot/users", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "activation", label: "Activation", href: "/admin/pilot/activation", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
    { id: "growth", label: "Growth", href: "/admin/pilot/growth", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg> },
    { id: "merchant-intelligence", label: "Merchant Sales", href: "/admin/pilot/merchant-intelligence", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
    
    { id: "marketing", label: "Marketing", href: "/admin/pilot/marketing", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg> },
    { id: "notifications", label: "Notifications", href: "/admin/pilot/notifications", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg> },
    { id: "offers", label: "Offers", href: "/admin/pilot/offers", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    
    { id: "actions", label: "Owner Actions", href: "/admin/pilot/actions", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: "results", label: "Evaluation", href: "/admin/pilot/results", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-1.81.688l1.154 5.073c.114.506-.442.911-.885.618l-4.71-3.07a.563.563 0 00-.608 0l-4.71 3.07c-.443.293-1-.112-.885-.618l1.154-5.073a.563.563 0 00-1.81-.688l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> }
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-300 font-sans">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 flex-shrink-0">
          <Link href="/admin/pilot" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-lg">U</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight leading-none">UBOS<span className="text-blue-500">PILOT</span></h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Owner Backend</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">CONTROL</p>
            {navItems.slice(0, 2).map(item => (
              <Link key={item.id} href={item.href} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all "}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">GROWTH INTEL</p>
            {navItems.slice(2, 6).map(item => (
              <Link key={item.id} href={item.href} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all "}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">MARKETING & OFFERS</p>
            {navItems.slice(6, 9).map(item => (
              <Link key={item.id} href={item.href} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all "}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">EXECUTION</p>
            {navItems.slice(9, 11).map(item => (
              <Link key={item.id} href={item.href} className={"flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all "}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>
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

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 sticky top-0 z-20 border-b border-slate-800">
        <Link href="/admin/pilot" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-base">U</span>
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-none">UBOS<span className="text-blue-500">PILOT</span></h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Owner Backend</p>
          </div>
        </Link>
        {logoutAction && (
          <form action={logoutAction}>
            <button type="submit" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </form>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-0 bg-white text-slate-900 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none md:mt-2 md:mr-2 shadow-2xl overflow-hidden pb-20 md:pb-0 relative">
        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-30 px-2 pb-safe">
        <div className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide py-2 h-16">
          <div className="flex gap-1 px-2">
            {navItems.map(item => (
              <Link 
                key={item.id} 
                href={item.href} 
                className={"flex-none snap-center flex flex-col items-center justify-center w-[72px] h-full transition-colors "}
              >
                <div className={"mb-1 p-1.5 rounded-full "}>
                  {item.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-center px-1 truncate w-full">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
