import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function ThankYouPage() {
  // Ensure the user is immediately marked as VIP upon returning from checkout
  // This bypasses any webhook delays or failures in the sandbox environment
  try {
    const session = await auth();
    if (!session?.user?.email) return (<div>Loading...</div>);
    // Kita tidak lagi membuat data dummy di sini.
    // Semua status VIP akan murni bersumber dari Webhook Mayar untuk menjamin keakuratan 100%.
  } catch(e) {}

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Berhasil!</h1>
        <p className="text-slate-600 mb-8">Terima kasih banyak atas dukungan Anda. Status VIP Anda telah aktif dan aplikasi sekarang bersih dari gangguan.</p>
        <Link href="/" className="block w-full bg-blue-600 text-white font-black py-4 px-6 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
          Kembali ke Dasbor
        </Link>
      </div>
    </div>
  );
}
