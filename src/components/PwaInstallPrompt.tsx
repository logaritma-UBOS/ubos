'use client';

import { useState, useEffect } from 'react';
import { Share, X, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Check if the app is already installed / running in standalone mode
    const isStandalone = () => {
      return ('standalone' in window.navigator && (window.navigator as any).standalone) || 
             window.matchMedia('(display-mode: standalone)').matches;
    };

    // Check if user has already dismissed the prompt
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');

    if (isIos() && !isStandalone() && !hasDismissed) {
      // Small delay to not overwhelm user on initial load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 flex justify-center pb-8"
        >
          <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-2xl p-4 w-full max-w-sm relative border border-slate-200 dark:border-slate-700">
            <button 
              onClick={dismissPrompt}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                <img src="/icon192.png" alt="UBOS" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Install Aplikasi UBOS</h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Install aplikasi ini di iPhone Anda untuk akses lebih cepat dan layar penuh.
                </p>
                
                <div className="mt-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-2.5 flex items-center gap-2 text-[11px] font-medium border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    1. Tap <Share size={14} className="text-blue-500" />
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1.5">
                    2. Pilih <PlusSquare size={14} className="text-slate-600 dark:text-slate-300" /> <span className="font-bold">Add to Home Screen</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
