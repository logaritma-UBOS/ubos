"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackerScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Hanya lacak halaman publik
    const isPublic = pathname === "/" || pathname?.startsWith("/login") || pathname?.startsWith("/register");
    if (!isPublic) return;

    // Hitung 1 device = 1 kunjungan per hari (Daily Unique Visitor)
    const today = new Date().toDateString();
    const lastTracked = localStorage.getItem("ubos_device_tracked_date");
    
    if (lastTracked === today) {
      return; // Sudah dihitung hari ini untuk device ini
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer
      })
    }).then(res => {
      if (res.ok) {
        // Tandai device ini sudah terekam hari ini
        localStorage.setItem("ubos_device_tracked_date", today);
      }
    }).catch(() => {});
  }, [pathname]);

  return null;
}
