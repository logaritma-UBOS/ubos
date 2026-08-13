import React from 'react';
import { formatIDR } from '@/lib/utils';

interface ReceiptProps {
  merchant: any;
  items: { namaProduk: string; qty: number; hargaSatuan: number; isCustom?: boolean; panjang?: number; lebar?: number; }[];
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  customerName?: string;
  date?: Date;
}

export default function Receipt({ merchant, items, total, paymentMethod, cashReceived, change, customerName, date = new Date() }: ReceiptProps) {
  return (
    <div className="hidden print:block print-only bg-white text-black p-4 w-full max-w-[58mm] mx-auto text-[11px] font-mono leading-tight">
      <div className="text-center mb-4 border-b border-dashed border-black pb-4">
        <h2 className="font-bold text-sm uppercase">{merchant?.nama_usaha || 'Toko'}</h2>
        <p className="text-[10px] mt-1">{merchant?.alamat || ''}</p>
        <p className="text-[10px]">{merchant?.nomor_whatsapp ? `WA: ${merchant.nomor_whatsapp}` : ''}</p>
      </div>
      
      <div className="mb-4 text-[10px]">
        <p>Tanggal : {date.toLocaleString('id-ID')}</p>
        <p>Kasir   : Admin</p>
        {customerName && <p>Plgn    : {customerName}</p>}
      </div>
      
      <div className="border-b border-dashed border-black pb-2 mb-2">
        {items.map((item, idx) => (
          <div key={idx} className="mb-2">
            <div className="font-bold">{item.namaProduk}</div>
            {item.isCustom && item.panjang && item.lebar && (
              <div className="text-[9px] text-gray-700 pl-2">Ukuran: {item.panjang}x{item.lebar} cm</div>
            )}
            <div className="flex justify-between">
              <span>{item.qty} x {formatIDR(item.hargaSatuan)}</span>
              <span>{formatIDR(item.qty * item.hargaSatuan)}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-1 mb-4 border-b border-dashed border-black pb-4">
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatIDR(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>METODE</span>
          <span>{paymentMethod}</span>
        </div>
        {paymentMethod === 'TUNAI' && cashReceived !== undefined && change !== undefined && (
          <>
            <div className="flex justify-between">
              <span>TUNAI</span>
              <span>{formatIDR(cashReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>KEMBALI</span>
              <span>{formatIDR(change)}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="text-center text-[10px] mt-6">
        <p>Terima Kasih</p>
        <p>Atas Kunjungan Anda</p>
        <p className="mt-4 text-[8px] text-gray-500">Powered by UBOS</p>
      </div>
    </div>
  );
}
