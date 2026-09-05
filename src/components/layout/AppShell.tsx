import DesktopSidebar from "@/components/layout/DesktopSidebar"
import MobileBottomNav from "@/components/layout/MobileBottomNav"

/**
 * AppShell — Wrapper for all authenticated app pages.
 * - Desktop (lg+): Renders persistent left sidebar + main content area
 * - Mobile: Sidebar is hidden (hidden lg:flex), children render full-width
 * 
 * Usage: wrap page return with <AppShell businessName={business.name}>...</AppShell>
 */
export default function AppShell({
  children,
  businessName,
}: {
  children: React.ReactNode
  businessName?: string
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Persistent Desktop Sidebar */}
      <DesktopSidebar businessName={businessName} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
      
      {/* Global Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
