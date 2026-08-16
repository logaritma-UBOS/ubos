'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, RefreshCcw, Search, CheckCircle2, AlertCircle, Phone, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CrmLog {
  id: string;
  campaign_name: string;
  target_audience: string;
  message_template: string;
  merchant_id: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
}

export default function OpsWaCrmPage() {
  const [logs, setLogs] = useState<CrmLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_broadcast_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat log CRM: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
              <MessageSquare size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">WA Smart CRM Logs</h1>
          </div>
          <p className="text-slate-400 text-sm">Riwayat pengiriman pesan WhatsApp via Fonnte (1-on-1 & Broadcast).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Cari pesan / nomor..." className="bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-blue-500/50 text-sm w-64" />
          </div>
          <button onClick={fetchLogs} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-slate-400 relative">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu & Tanggal</th>
                <th className="px-6 py-4">Tipe & Target</th>
                <th className="px-6 py-4 max-w-md">Isi Pesan</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 animate-pulse">Memuat riwayat pesan...</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare size={40} className="text-slate-700 mb-3" />
                      <p>Belum ada riwayat pesan yang terkirim via Fonnte.</p>
                      <p className="text-xs text-slate-600 mt-1">Gunakan tombol "Chat Fonnte" di halaman Funnel / Merchants.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-300">{formatDateTime(log.created_at)}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Calendar size={10} /> ID: {log.id.split('-')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-400 uppercase text-xs mb-1 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">
                        {log.message_template}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                        <Phone size={12} className="text-slate-500" /> {log.phone || log.target_audience}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-xs text-slate-400 line-clamp-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 italic">
                        {log.message || "Pesan tidak terekam."}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.status === 'sent' || log.status === 'success' ? (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                          <CheckCircle2 size={12} /> Terkirim
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-black uppercase">
                          <ArrowUpRight size={12} /> Dikirim
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
