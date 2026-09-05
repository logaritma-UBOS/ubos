"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MidnightAutoLogout() {
  const router = useRouter();

  useEffect(() => {
    // Tanggal saat komponen dimuat
    const loadDayStr = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(new Date());

    const interval = setInterval(() => {
      const currentDayStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date());

      // Jika hari telah berganti sejak halaman terakhir dimuat
      if (loadDayStr !== currentDayStr) {
        // Refresh halaman agar middleware/server component (layout) melempar user ke /login
        window.location.reload();
      }
    }, 60000); // Cek setiap 1 menit

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
