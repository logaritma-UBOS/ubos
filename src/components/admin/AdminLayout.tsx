import Link from "next/link"
import { ReactNode } from "react"
import { IconHome, IconInsights, IconWarning, IconTrendingUp } from "@/components/ui/Icons"

interface AdminLayoutProps {
  children: ReactNode
  activeMenu?: string
  logoutAction?: () => void
}

export default function AdminLayout({ children, activeMenu = "control", logoutAction }: AdminLayoutProps) {
  const navItems = [
    { id: "control", label: "Control", href: "/admin/pilot", icon: <IconHome className="w-5 h-5" /> },
    { id: "users", label: "Users", href: "/admin/pilot/users", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { id: "marketing", label: "Marketing", href: "/admin/pilot/marketing", icon: <IconInsights className="w-5 h-5" /> },
    { id: "actions", label: "Actions", href: "/admin/pilot/actions", icon: <IconWarning className="w-5 h-5" /> },
    { id: "revenue", label: "Revenue", href: "/admin/pilot/revenue", icon: <IconTrendingUp className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-24 md:pb-0 font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 min-h-screen fixed left-0 top-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">UBOS<span className="text-blue-500">PILOT</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Owner Engine</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link 
              key={item.id} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeMenu === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {logoutAction && (
          <div className="p-4 border-t border-slate-800">
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl text-sm font-bold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                Logout Admin
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center h-[68px] z-50 px-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        {navItems.map(item => (
          <Link 
            key={item.id} 
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeMenu === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`mb-1 p-1.5 rounded-full ${activeMenu === item.id ? 'bg-blue-500/20' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  )
}
