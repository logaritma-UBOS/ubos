"use client"
import { formatNumber, formatRupiah } from '@/lib/format';

import Link from "next/link"

type StrukClientProps = {
  sale: any
  business: any
}

export default function StrukClient({ sale, business }: StrukClientProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex flex-col items-center justify-start print-wrapper">
      
      {/* Container Kertas Struk */}
      <div className="receipt-container w-full max-w-xs sm:max-w-sm bg-white shadow-xl p-4 mx-auto rounded-lg">
        
        {/* Header Struk */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg uppercase">{business.name}</h1>
          {business.settings?.storeAddress && (
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{business.settings.storeAddress}</p>
          )}
          {business.settings?.storePhone && (
            <p className="text-xs text-gray-700">{business.settings.storePhone}</p>
          )}
        </div>

        <div className="border-b border-dashed border-gray-400 mb-3 print:border-black"></div>

        {/* Info Transaksi */}
        <div className="mb-3 text-xs text-gray-800">
          <div className="flex justify-between">
            <span>No:</span>
            <span className="font-mono">{sale.receiptNumber || sale.clientTransactionId.substring(0, 14)}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span>{new Date(sale.createdAt).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Metode:</span>
            <span>{sale.paymentMethod}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-gray-400 mb-3 print:border-black"></div>

        {/* Item List */}
        <div className="mb-3">
          {sale.saleItems.map((item: any) => (
            <div key={item.id} className="mb-2 text-xs text-gray-800 flex flex-col">
              <span className="font-medium truncate">{item.product.name}</span>
              <div className="flex justify-between mt-0.5">
                <span>{item.quantity} x {formatNumber(item.priceAtSale)}</span>
                <span className="font-bold">{formatNumber((item.quantity * item.priceAtSale))}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-gray-400 mb-3 print:border-black"></div>

        {/* Total & Payment */}
        <div className="mb-4 text-xs text-gray-900">
          {sale.discount > 0 && (
            <>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>{formatRupiah((sale.totalAmount + sale.discount))}</span>
              </div>
              <div className="flex justify-between text-green-700 mb-1">
                <span>Diskon Promo</span>
                <span>- {formatRupiah(sale.discount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold mb-1">
            <span>TOTAL</span>
            <span>{formatRupiah(sale.totalAmount)}</span>
          </div>

          {sale.paymentMethod === "CASH" && (
            <>
              <div className="flex justify-between text-gray-700">
                <span>Tunai</span>
                <span>{formatRupiah((sale.cashReceived || sale.totalAmount))}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Kembali</span>
                <span>{formatRupiah((sale.changeAmount || 0))}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 mt-6 print:mt-4">
          <p>{business.settings?.receiptFooter || "Terima kasih atas kunjungannya!"}</p>
        </div>
        
        <div className="h-4"></div> {/* Spacing untuk printer */}
      </div>

      {/* Action Buttons (Not Printed) */}
      <div className="w-full max-w-xs sm:max-w-sm mt-6 flex flex-col gap-3 print:hidden mx-auto">
        <button 
          onClick={handlePrint}
          className="w-full py-3 bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:bg-primary-800 transition-colors"
        >
          Cetak Struk
        </button>
        <Link 
          href="/kasir"
          className="w-full py-3 bg-white text-gray-800 border border-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-center block"
        >
          Transaksi Baru
        </Link>
      </div>

      {/* CSS Layout Fix for Thermal Printers */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: 58mm auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            width: 100% !important;
          }
          .print-wrapper {
            min-height: 0 !important;
            height: auto !important;
            background-color: white !important;
            padding: 0 !important;
            display: block !important;
          }
          .receipt-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            font-family: monospace !important;
            color: black !important;
          }
          /* Hide global floating buttons like WhatsApp during print */
          .fixed, [class*="fixed"], iframe {
            display: none !important;
          }
        }
      `}} />
    </div>
  )
}
