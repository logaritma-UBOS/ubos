import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Copilot from '@/components/Copilot';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export default function AiCopilotDrawer({ isOpen, onClose, category }: AiCopilotDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div 
        className={`fixed z-[101] flex flex-col bg-slate-50 transition-transform duration-300 shadow-2xl overflow-hidden
          ${/* Desktop: Slide from right */ ''}
          md:top-0 md:right-0 md:left-auto md:bottom-0 md:w-[420px] md:rounded-none md:h-full
          ${/* Mobile: Slide from bottom */ ''}
          bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl md:translate-y-0
          ${isOpen 
            ? 'translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
      >
        {/* Mobile Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-white cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-4 md:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 relative shadow-sm">
              <img src="/images/ai-copilot-icon.png" alt="AI Copilot" className="w-6 h-6 object-contain" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                AI Copilot
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1">
                <Sparkles size={10} className="text-blue-500" /> Logaritma Engine
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <Copilot inline={true} category={category} />
        </div>
      </div>
    </>
  );
}
