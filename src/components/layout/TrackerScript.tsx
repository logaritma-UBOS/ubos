"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackerScript() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track if it's the root landing page, or main auth routes (prevent spamming internal dashboard clicks)
    const isPublic = pathname === "/" || pathname?.startsWith("/login") || pathname?.startsWith("/register");
    if (!isPublic) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer
      })
    }).catch(() => {});
  }, [pathname]);

  return null;
}
