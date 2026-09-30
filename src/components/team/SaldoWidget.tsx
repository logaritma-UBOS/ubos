"use client"
import { formatRupiah } from "@/lib/format"
import { requestWithdrawal } from "@/actions/teamOs"
import { useState } from "react"
import BankSettingsModal from "./BankSettingsModal"

export default function SaldoWidget({ balance, totalEarned, ledgers, teamMember }: { balance: number, totalEarned: number, ledgers: any[], teamMember?: any }) {
    const [loading, setLoading] = useState(false);
    const [showBankSettings, setShowBankSettings] = useState(false);

    const handleWithdraw = async () => {
        if (balance <= 0) return alert("Saldo Anda kosong.");
        
        if (!teamMember?.bankAccount || !teamMember?.bankName) {
            alert("Silakan lengkapi data rekening bank Anda terlebih dahulu.");
            setShowBankSettings(true);
            return;
        }

        const amountStr = prompt(`Saldo Anda: ${formatRupiah(balance)}\n\nMasukkan nominal yang ingin ditarik:`, balance.toString());
        if (!amountStr) return;
        
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return alert("Nominal tidak valid");
        if (amount > balance) return alert("Nominal melebihi saldo tersedia");

        if (!confirm(`Anda yakin ingin mencairkan Rp ${amount.toLocaleString("id-ID")} ke ${teamMember.bankName} (${teamMember.bankAccount})?\n\nSistem akan menembak API Mayar untuk transfer otomatis!`)) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("amount", amount.toString());
        
        const res = await requestWithdrawal(formData);
        setLoading(false);

        if (res?.error) {
            alert("GAGAL: " + res.error);
        } else {
            alert("BERHASIL: Uang sedang ditransfer ke rekening Anda via Mayar Disbursement!");
        }
    }

    return (
        <>
            <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Saldo Tersedia</p>
                        <h3 className="text-3xl font-black">{formatRupiah(balance)}</h3>
                        {teamMember?.bankAccount && (
                            <p className="text-[10px] text-gray-400 mt-2 cursor-pointer hover:text-white" onClick={() => setShowBankSettings(true)}>
                                Bank: {teamMember.bankName} - {teamMember.bankAccount} ⚙️
                            </p>
                        )}
                        {!teamMember?.bankAccount && (
                            <p className="text-[10px] text-red-400 mt-2 cursor-pointer hover:text-white font-bold" onClick={() => setShowBankSettings(true)}>
                                ⚠️ Rekening Belum Diatur (Klik untuk atur)
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={handleWithdraw}
                        disabled={loading || balance <= 0}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-white/10 disabled:opacity-50"
                    >
                        {loading ? "Memproses..." : "Tarik Saldo"}
                    </button>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Riwayat Transaksi Terakhir</p>
                    <div className="space-y-2">
                        {ledgers.length === 0 && <p className="text-xs text-gray-500">Belum ada riwayat transaksi.</p>}
                        {ledgers.map(l => (
                            <div key={l.id} className="flex justify-between items-center text-xs">
                                <span className="text-gray-300 truncate max-w-[200px]">{l.description}</span>
                                <span className={`font-bold ${l.type === "WITHDRAWAL" ? "text-red-400" : "text-emerald-400"}`}>
                                    {l.type === "WITHDRAWAL" ? "-" : "+"}{formatRupiah(l.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showBankSettings && teamMember && (
                <BankSettingsModal 
                    teamMember={teamMember} 
                    onClose={() => setShowBankSettings(false)} 
                />
            )}
        </>
    )
}
