'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Bot, Terminal, Sliders, MessageSquare, Play, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AIPrompt {
  id: string;
  agent_role: string;
  name: string;
  system_prompt: string;
  is_active: boolean;
  model_name?: string;
  temperature?: number;
}

export default function AICopilotPage() {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    is_active: true,
    system_prompt: '',
    model_name: 'Gemini 1.5 Flash',
    temperature: 0.7
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Playground State
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat AI Prompts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfig = (prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      is_active: prompt.is_active,
      system_prompt: prompt.system_prompt,
      model_name: prompt.model_name || 'Gemini 1.5 Flash',
      temperature: prompt.temperature ?? 0.7
    });
    setTestInput('');
    setTestOutput('');
    setIsModalOpen(true);
  };

  const handleCloseConfig = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('ai_prompts')
        .update({
          is_active: formData.is_active,
          system_prompt: formData.system_prompt,
          model_name: formData.model_name,
          temperature: formData.temperature
        })
        .eq('id', selectedPrompt.id);

      if (error) throw error;

      setPrompts(prompts.map(p => p.id === selectedPrompt.id ? { ...p, ...formData } : p));
      toast.success('Konfigurasi Prompt AI berhasil diperbarui!');
      handleCloseConfig();
    } catch (error: any) {
      toast.error('Gagal menyimpan: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestPlayground = () => {
    if (!testInput.trim()) return;
    
    setIsTesting(true);
    setTestOutput('');
    
    // Simulate AI typing delay for testing
    setTimeout(() => {
      setTestOutput(`[Simulated Response from ${formData.model_name} at Temp ${formData.temperature}]\n\nBerdasarkan prompt Anda: "${testInput}", saya sebagai ${selectedPrompt?.name} akan merespons sesuai system prompt yang diberikan. \n\nSemua parameter operasional normal dan logika berjalan sesuai dengan batas instruksi.`);
      setIsTesting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Bot size={20} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">AI Copilot Config</h1>
          </div>
          <p className="text-slate-400 text-sm">Konfigurasi System Prompt & Parameter Engine LLM untuk 4 Agen AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-40 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse"></div>)
        ) : prompts.map((prompt) => (
          <div 
            key={prompt.id} 
            onClick={() => handleOpenConfig(prompt)}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl group cursor-pointer hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{prompt.name}</h3>
              <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase ${prompt.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {prompt.is_active ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
              <Terminal size={14} className="absolute right-4 top-4 text-slate-600" />
              <p className="text-xs text-slate-400 font-mono pr-8 leading-relaxed line-clamp-3">
                {prompt.system_prompt}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{prompt.model_name || 'Gemini 1.5 Flash'}</span>
              <span>Temp: {prompt.temperature ?? 0.7}</span>
            </div>
          </div>
        ))}
      </div>

      {/* POP-UP MODAL AI EDITOR */}
      {isModalOpen && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseConfig}></div>
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Sliders size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Parameter Editor</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedPrompt.name} Configuration</p>
                </div>
              </div>
              <button onClick={handleCloseConfig} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* Form Settings (Left) */}
              <div className="w-full lg:w-1/2 p-6 overflow-y-auto border-r border-slate-800">
                <form id="ai-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-sm font-bold text-white">Agent Status</p>
                      <p className="text-xs text-slate-500">Aktifkan atau matikan agent ini.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Model Engine</label>
                    <select 
                      value={formData.model_name}
                      onChange={e => setFormData({...formData, model_name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 appearance-none"
                    >
                      <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Fast & Efficient)</option>
                      <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Complex Reasoning)</option>
                      <option value="GPT-4o-mini">GPT-4o-mini</option>
                      <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temperature</label>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{formData.temperature}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={formData.temperature}
                      onChange={e => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>Strict / Logical</span>
                      <span>Creative / Random</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Prompt (Context & Rules)</label>
                    <textarea 
                      value={formData.system_prompt}
                      onChange={e => setFormData({...formData, system_prompt: e.target.value})}
                      rows={8}
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-100/80 font-mono text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
                    />
                  </div>
                </form>
              </div>

              {/* Test Playground (Right) */}
              <div className="w-full lg:w-1/2 bg-slate-950 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                  <MessageSquare size={16} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-300">Test Playground</h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  {testOutput ? (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {testOutput}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-sm text-center px-8 border-2 border-dashed border-slate-800 rounded-xl">
                      Ketik skenario pesan dari user di bawah untuk menguji respons agen dengan prompt saat ini.
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={testInput}
                      onChange={e => setTestInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTestPlayground()}
                      placeholder="Uji coba ketik pesan di sini..."
                      className="flex-1 bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500/50"
                    />
                    <button 
                      onClick={handleTestPlayground}
                      disabled={isTesting || !testInput.trim()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                      {isTesting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Play size={18} />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
              <p className="text-xs text-slate-500">Perubahan prompt akan langsung efektif untuk sesi chat berikutnya.</p>
              <button 
                type="submit" 
                form="ai-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                <Save size={16} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
