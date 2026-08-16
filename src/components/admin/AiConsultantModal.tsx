'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Copy, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export type AgentRole = 'GROWTH' | 'OPS' | 'FINANCE' | 'TECH';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentRole: AgentRole | null;
}

const roleConfig = {
  GROWTH: { name: 'AI Growth Lead', color: 'emerald', focus: 'Target Leads & Konversi' },
  OPS: { name: 'AI Ops & Retention', color: 'blue', focus: 'Follow-up Trial & Merchant Churn' },
  FINANCE: { name: 'AI Finance Officer', color: 'amber', focus: 'Kas, OPEX & Profit Rp10 Juta' },
  TECH: { name: 'AI Tech Lead', color: 'purple', focus: 'Uptime & Bug Monitoring' },
};

export default function AiConsultantModal({ isOpen, onClose, agentRole }: AiConsultantModalProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchAnalysis = async (role: AgentRole) => {
    setLoading(true);
    setError('');
    setAnalysis('');
    
    try {
      const response = await fetch('/api/admin/ai-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_role: role }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat analisis AI');
      }
      
      setAnalysis(data.analysis || 'Tidak ada analisis yang diberikan.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan sistem saat menghubungi AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && agentRole) {
      fetchAnalysis(agentRole);
    }
  }, [isOpen, agentRole]);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !agentRole) return null;

  const config = roleConfig[agentRole];
  
  // Dynamic color classes based on role
  const colorMap: Record<string, { bg: string, text: string, border: string, pulse: string }> = {
    emerald: { bg: 'bg-emerald-950/30', text: 'text-emerald-400', border: 'border-emerald-800/50', pulse: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' },
    blue: { bg: 'bg-blue-950/30', text: 'text-blue-400', border: 'border-blue-800/50', pulse: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' },
    amber: { bg: 'bg-amber-950/30', text: 'text-amber-400', border: 'border-amber-800/50', pulse: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
    purple: { bg: 'bg-purple-950/30', text: 'text-purple-400', border: 'border-purple-800/50', pulse: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' },
  };
  
  const colors = colorMap[config.color];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-2xl bg-slate-900 border ${colors.border} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 ${colors.bg}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-950 border ${colors.border}`}>
                  <Bot className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{config.name}</h2>
                    <div className={`w-2 h-2 rounded-full ${colors.pulse} animate-pulse`}></div>
                  </div>
                  <p className="text-sm text-slate-400">Fokus: {config.focus}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm sm:text-base">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className={`w-5 h-5 ${colors.text} animate-spin`} />
                    <p className="font-medium text-slate-300">Menyinkronkan data real-time & menganalisis...</p>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
                    <div className="h-10"></div>
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2"></div>
                    <div className="h-16 bg-slate-800 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Analisis Gagal</h3>
                  <p className="text-slate-400 max-w-sm">{error}</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-emerald max-w-none">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/50 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopy}
                disabled={loading || !!error || !analysis}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  copied 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                    : 'bg-white text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Salin Rencana Aksi'}
              </button>
              
              <button
                onClick={() => fetchAnalysis(agentRole)}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Analisa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
