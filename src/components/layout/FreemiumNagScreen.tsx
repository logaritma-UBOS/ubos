"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function FreemiumNagScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(20);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVIP, setIsVIP] = useState(true); // Assume VIP until checked
  const [showThankYou, setShowThankYou] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check status
    fetch("/api/user/status")
      .then(r => r.json())
      .then(data => {
        // Cegah muncul di Landing Page (not authenticated & route is '/')
        if (pathname === '/' && !data.isAuthenticated) {
          return;
        }

        // Jika terautentikasi (masuk dashboard) dan BUKAN VIP
        if (data.isAuthenticated && !data.isVIP) {
          setIsVIP(false);
          checkNagSchedule();
        }
      })
      .catch(() => {});
  }, [pathname]);

  const checkNagSchedule = () => {
    const lastNag = localStorage.getItem("ubos_last_nag");
    const now = Date.now();
    // 3 minutes = 3 * 60 * 1000 = 180000 ms
    const NAG_INTERVAL = 180000; 

    if (!lastNag || (now - parseInt(lastNag, 10)) > NAG_INTERVAL) {
      triggerNag();
    } else {
      const timeRemaining = NAG_INTERVAL - (now - parseInt(lastNag, 10));
      setTimeout(() => triggerNag(), timeRemaining);
    }
  };

  useEffect(() => {
    const handleOpenDonate = () => {
      setIsOpen(true);
      setCanClose(true); // Allow closing if opened manually
      setCountdown(0);
    };
    
    window.addEventListener('open-donate-modal', handleOpenDonate);
    return () => window.removeEventListener('open-donate-modal', handleOpenDonate);
  }, []);

  const triggerNag = () => {
    setIsOpen(true);
    setCanClose(false);
    setCountdown(20);
    localStorage.setItem("ubos_last_nag", Date.now().toString());

    // Setup 3 min next trigger
    setTimeout(() => {
      checkNagSchedule();
    }, 180000);
  };

  useEffect(() => {
    if (isOpen && !canClose) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, canClose]);

  const handlePayment = async () => {
    if (!amount || Number(amount) < 10000) return alert("Minimal dukungan Rp 10.000");
    setIsLoading(true);
    try {
      const res = await fetch("/api/mayar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.link) {
        window.open(data.link, "_blank");
        
        // Wait for webhook to process, simulate polling
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          const st = await fetch("/api/user/status").then(r => r.json());
          if (st.isVIP) {
            clearInterval(poll);
            setIsVIP(true);
            setIsOpen(false);
            setShowThankYou(true);
            setTimeout(() => {
              setShowThankYou(false);
              router.refresh();
            }, 5000);
          } else if (attempts > 60) {
            // timeout after 5 mins
            clearInterval(poll);
            setIsLoading(false);
          }
        }, 5000);

      } else {
        alert(data.error || "Gagal membuat tagihan");
        setIsLoading(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan");
      setIsLoading(false);
    }
  };

  const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/thank-you') || pathname?.startsWith('/toko');

  if (isExcluded) return null;

  if (isVIP) {
    if (showThankYou) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
             <div className="text-6xl mb-4">🎉</div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Terima Kasih!</h2>
             <p className="text-slate-600">Dukungan Anda membuat UBOS terus berkembang. Mode VIP telah diaktifkan.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl overflow-hidden max-w-[400px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-50 bg-slate-50/50">
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 transform rotate-3">
            <span className="text-3xl">☕</span>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2.5 tracking-tight">Dukung Perjalanan Kami</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed font-medium px-2">
            UBOS dikembangkan oleh tim kecil yang berdedikasi. Jika aplikasi ini membantu bisnis Anda, sekecil apapun dukungan Anda akan sangat membantu biaya server kami agar UBOS tetap 100% gratis.
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-bold text-slate-700 text-sm">Menyiapkan pembayaran...</p>
              <p className="text-xs text-slate-500 mt-2">Jendela ini akan tertutup otomatis setelah berhasil.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {[25000, 50000, 100000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${amount === val.toString() ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {val / 1000}K
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-semibold text-sm">Rp</span>
                  </div>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Nominal lainnya (Min 10rb)"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 font-semibold text-slate-700 text-sm transition-all placeholder:font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button 
                  onClick={handlePayment}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-200 transition-all text-sm"
                >
                  Kirim Dukungan
                </button>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={!canClose}
                  className={`w-full py-3 rounded-xl font-semibold transition-all text-sm ${canClose ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50' : 'text-slate-400 cursor-not-allowed'}`}
                >
                  {canClose ? "Lain kali saja" : `Bisa ditutup dalam ${countdown} detik`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
