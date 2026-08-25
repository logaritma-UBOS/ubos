'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface UBOSLoadingProps {
  fullScreen?: boolean;
  show?: boolean;
  delayMs?: number;
  text?: string;
}

export default function UBOSLoading({ 
  fullScreen = true, 
  show = true, 
  delayMs = 0,
  text = 'Memuat UBOS...' 
}: UBOSLoadingProps) {
  const [shouldRender, setShouldRender] = useState(delayMs === 0 ? show : false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (show) {
      if (delayMs > 0) {
        timer = setTimeout(() => setShouldRender(true), delayMs);
      } else {
        setShouldRender(true);
      }
    } else {
      setShouldRender(false);
    }
    return () => clearTimeout(timer);
  }, [show, delayMs]);

  if (!shouldRender) return null;

  const containerClass = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm"
    : "flex-1 flex flex-col items-center justify-center min-h-[50dvh] w-full bg-transparent";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Subtle pulse ring behind */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
          {/* Main Logo */}
          <div className="relative z-10 w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-100">
            <Image 
              src="/icon.png" 
              alt="UBOS Loading" 
              width={40} 
              height={40}
              className="animate-pulse object-contain"
              priority
            />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
      </div>
    </div>
  );
}
