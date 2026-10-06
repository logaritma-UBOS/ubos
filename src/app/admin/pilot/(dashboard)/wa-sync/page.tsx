import { Metadata } from "next"
import { MasterWaSyncClient } from "./WaSyncClient"

export const metadata: Metadata = {
  title: "Sinkronisasi Master WA - Team OS",
}

export default function MasterWaSyncPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sinkronisasi WA Pribadi</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scan QR Code di bawah ini untuk menghubungkan WhatsApp pribadi Anda. Seluruh pesan Follow-Up dan Blast yang Anda kirim dari akun ini akan menggunakan nomor Anda sendiri.
        </p>
      </div>
      
      <MasterWaSyncClient />
    </div>
  )
}

