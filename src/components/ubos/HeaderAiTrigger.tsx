'use client';

import React, { useState, useEffect } from 'react';
import AiCopilotDrawer from './AiCopilotDrawer';
import { useParams } from 'next/navigation';

export default function HeaderAiTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const category = (params.category as string) || 'default';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 border border-blue-500/20 rounded-full px-3 py-1.5 flex items-center gap-2 transition-all cursor-pointer shadow-sm min-h-[44px] min-w-[44px]"
      >
        <div className="relative">
          <img src="/images/ai-copilot-icon.png" alt="AI Icon" className="w-5 h-5 object-contain" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-pulse"></span>
        </div>
        <span className="text-sm font-bold whitespace-nowrap hidden sm:inline-block">Analisa AI Copilot</span>
        <span className="text-sm font-bold whitespace-nowrap sm:hidden">AI</span>
      </button>

      {/* Slide-over Drawer Portal */}
      <AiCopilotDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        category={category}
      />
    </>
  );
}
