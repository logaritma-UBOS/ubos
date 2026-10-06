"use client";

import { useState } from "react";
import { sendWaBlastFonnte } from "@/actions/admin";

export default function FonnteWaButton({ 
  phone, 
  name,
  statusLabel
}: { 
  phone?: string | null, 
  name?: string | null,
  statusLabel?: string
}) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!phone) {
    return <span className="text-[10px] text-slate-400 font-medium italic">No HP tidak ada</span>;
  }

  const handleBlast = async () => {
    let msg = `Halo Kak ${name || ""}! Kami dari admin UBOS.

`;
    if (statusLabel?.includes("Berjualan")) {
      msg += `Selamat, kami lihat toko Kakak sudah aktif berjualan! 🎉 Apakah ada fitur premium yang ingin Kakak coba untuk meningkatkan omzet lebih jauh?`;
    } else if (statusLabel?.includes("Setup")) {
      msg += `Kami lihat Kakak sedang mengatur katalog produk. Ada kesulitan? Jangan ragu untuk tanya kami ya!`;
    } else {
      msg += `Kami perhatikan Kakak baru bergabung tapi belum melengkapi toko. Butuh panduan langkah pertama dari tim kami?`;
    }
    
    if (!confirm(`Kirim pesan WA Blast ke ${phone} via WA Engine?\n\nPesan:\n${msg}`)) return;
    
    setIsLoading(true);
    try {
      await sendWaBlastFonnte(phone, msg);
      alert("Pesan berhasil dikirim via Private Engine!");
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBlast}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50 shadow-sm shadow-emerald-500/20"
    >
      {isLoading ? "MENGIRIM..." : "KIRIM WA BLAST (API)"}
    </button>
  );
}
