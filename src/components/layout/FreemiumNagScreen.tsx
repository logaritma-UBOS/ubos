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
        if (!data.isVIP) {
          setIsVIP(false);
          checkNagSchedule();
        }
      })
      .catch(() => {});
  }, []);

  const checkNagSchedule = () => {
    const lastNag = localStorage.getItem("ubos_last_nag");
    const now = Date.now();
    // 15 minutes = 15 * 60 * 1000 = 900000 ms
    const NAG_INTERVAL = 60000; // 1 min 

    if (!lastNag || (now - parseInt(lastNag, 10)) > NAG_INTERVAL) {
      triggerNag();
    } else {
      const timeRemaining = NAG_INTERVAL - (now - parseInt(lastNag, 10));
      setTimeout(() => triggerNag(), timeRemaining);
    }
  };

  const triggerNag = () => {
    setIsOpen(true);
    setCanClose(false);
    setCountdown(20);
    localStorage.setItem("ubos_last_nag", Date.now().toString());

    // Setup 15 min next trigger
    setTimeout(() => {
      checkNagSchedule();
    }, 60000);
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

  const isExcluded = pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/thank-you');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Dukung UBOS</h2>
          <p className="text-blue-100 text-sm">UBOS gratis 100% tanpa iklan. Dukung kami untuk terus berinovasi dan nikmati pengalaman VIP yang bersih dari gangguan ini.</p>
        </div>
        
        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-bold text-slate-700">Menunggu Pembayaran...</p>
              <p className="text-sm text-slate-500 mt-2">Silakan selesaikan pembayaran di tab Mayar. Jendela ini akan otomatis tertutup setelah berhasil.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[25000, 50000, 100000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className={`py-2 rounded-xl border text-sm font-bold transition-all ${amount === val.toString() ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {val / 1000}K
                  </button>
                ))}
              </div>
              
              <div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Atau ketik nominal (Min 10.000)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={handlePayment}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-200 transition-all"
                >
                  Bayar Seikhlasnya & Hilangkan Pop-up
                </button>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={!canClose}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${canClose ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  {canClose ? "Nanti Saja (Tutup)" : `Tutup (${countdown} detik)`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
