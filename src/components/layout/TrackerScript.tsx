"use client"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function TrackerScript() {
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
        })
      }).catch(e => console.error("Track error", e))
    }
  }, [pathname])

  // Heartbeat / Online Tracker
  useEffect(() => {
    const pingServer = () => {
        fetch('/api/ping', { method: 'POST' }).catch(() => {});
    };
    
    pingServer(); // Ping on load
    const interval = setInterval(pingServer, 60000); // Ping every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  return null
}
