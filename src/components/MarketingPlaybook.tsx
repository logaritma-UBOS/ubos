'use client';
import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Zap, ArrowRight, XCircle, LayoutDashboard, MessageCircle, BarChart3, Clock, Loader2, Save, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function MarketingPlaybook() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default playbook templates
  const defaultTasks = [
    { week_number: 1, task_key: 'w1_t1', task_label: 'Buat 5 video short/reels tentang studi kasus UMKM bangkrut karena HPP salah.', target_metric: '5 Konten', current_metric: '' },
    { week_number: 1, task_key: 'w1_t2', task_label: 'Gunakan Fonnte WA untuk menyapa cold leads.', target_metric: '50 Leads (Free Trial)', current_metric: '' },
    { week_number: 2, task_key: 'w2_t1', task_label: 'Siapkan Marketing Kit (Swipe file, banner) di Dashboard Affiliate.', target_metric: '10 Kit Item', current_metric: '' },
    { week_number: 2, task_key: 'w2_t2', task_label: 'Webinar Zoom "Cara Dapat 5 Juta/Bulan Hanya Sebar Link UBOS".', target_metric: '10-20 Afiliator Aktif', current_metric: '' },
    { week_number: 3, task_key: 'w3_t1', task_label: 'Bagikan template Excel "Kalkulator HPP" gratis bersyarat (daftar UBOS).', target_metric: '100 Download', current_metric: '' },
    { week_number: 3, task_key: 'w3_t2', task_label: 'Gunakan WA Blast (Fonnte) ke database komunitas lokal.', target_metric: '200 Leads & 15 Konversi', current_metric: '' }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .select('*')
        .order('week_number', { ascending: true })
        .order('task_key', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, just use defaults locally
          setTasks(defaultTasks);
          setLoading(false);
          return;
        }
        throw error;
      }

      if (!data || data.length === 0) {
        // First time, seed the DB
        const { error: insertError } = await supabase
          .from('marketing_tasks')
          .insert(defaultTasks);
        
        if (insertError) {
          console.error("Gagal membuat template awal:", insertError);
          setTasks(defaultTasks); // Fallback locally
        } else {
          fetchTasks(); // Reload
        }
      } else {
        setTasks(data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengambil data task marketing: ' + err.message);
      // Fallback
      if (tasks.length === 0) setTasks(defaultTasks);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string | undefined, taskKey: string, updates: any) => {
    // Optimistic update locally
    setTasks(prev => prev.map(t => t.task_key === taskKey ? { ...t, ...updates } : t));
    
    // If we don't have an ID, it means it's not saved to DB yet (e.g. fallback mode)
    if (!id) return; 
    
    try {
      const { error } = await supabase
        .from('marketing_tasks')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menyimpan perubahan: ' + err.message);
    }
  };

  const getWeekTasks = (weekNum: number) => tasks.filter(t => t.week_number === weekNum);
  const calculateProgress = (weekNum: number) => {
    const weekTasks = getWeekTasks(weekNum);
    if (weekTasks.length === 0) return 0;
    const completed = weekTasks.filter(t => t.is_completed).length;
    return Math.round((completed / weekTasks.length) * 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Target Market & USP */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Target className="text-primary" /> Target Market & USP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-1">
            <h4 className="font-bold text-amber-400 mb-2">Target Market Utama</h4>
            <p className="text-white font-black text-lg mb-2">"The Overwhelmed Solopreneur"</p>
            <p className="text-sm text-slate-400 mb-4">(Owner F&B, Laundry, Percetakan, Ritel skala Mikro/Kecil)</p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h5 className="font-bold text-red-400 text-sm mb-2 flex items-center gap-2"><XCircle size={14}/> Core Pain Points:</h5>
              <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
                <li>Profit bocor (uang masuk & keluar campur)</li>
                <li>Operasional serba dikerjakan sendiri</li>
                <li>Pusing melacak HPP vs Harga Jual</li>
                <li>Gaptek, takut pakai sistem yang rumit</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2">
            <h4 className="font-bold text-emerald-400 mb-4">4 USP Highlights (Ultimate Selling Proposition)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/20 p-2 rounded-lg"><BarChart3 size={16} className="text-primary"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">1. Backward Mapping</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Kunci profit bersih harian. Ubah mindset "jualan dulu baru hitung untung" menjadi "tentukan target profit dulu, sistem yang hitung target jualan harian".</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-emerald-500/20 p-2 rounded-lg"><LayoutDashboard size={16} className="text-emerald-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">2. Instan Omnichannel</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Satu dashboard untuk POS Kasir Kasar & Toko Online bergaya e-commerce (Olshopin-style). Siap jualan online dalam 3 menit.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-500/20 p-2 rounded-lg"><Zap size={16} className="text-amber-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">3. AI Copilot Industri</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Asisten AI (Logaritma Engine) yang disesuaikan per kategori (F&B, Jasa, Ritel). Memberi saran HPP, promo, & efisiensi secara otomatis.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-500/20 p-2 rounded-lg"><Target size={16} className="text-purple-400"/></div>
                  <h5 className="font-bold text-slate-200 text-sm">4. 40% Affiliate Engine</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Lifetime locking cookies. Sistem viral marketing otomatis dimana pengguna bisa jadi afiliator dengan komisi recurring terbesar di kelasnya.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kompetitor Comparison */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <LayoutDashboard className="text-primary" /> Perbandingan vs Kompetitor
        </h3>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-bold border-b border-slate-700">Fitur / Benefit</th>
                  <th className="p-4 font-bold border-b border-slate-700 text-slate-400">POS Biasa (M**a, P***n)</th>
                  <th className="p-4 font-bold border-b border-slate-700 text-slate-400">Software Akuntansi (J****l)</th>
                  <th className="p-4 font-black border-b border-emerald-500 bg-emerald-500/10 text-emerald-400">Logaritma UBOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Toko Online Terintegrasi</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Bayar Add-on Mahal</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Gratis (Bawaan Sistem)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Fokus Keuangan</td>
                  <td className="p-4"><span className="text-amber-400">Hanya Catat Omzet</span></td>
                  <td className="p-4"><CheckCircle2 size={16} className="text-emerald-400 inline mr-2"/> Sangat Lengkap (Rumit)</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Target Profit (Backward Mapping)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Asisten AI Strategis</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Tidak Ada</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Logaritma Engine Khusus UMKM</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Learning Curve (Kemudahan)</td>
                  <td className="p-4"><span className="text-emerald-400">Mudah (Gampang dipelajari)</span></td>
                  <td className="p-4"><span className="text-red-400">Sangat Sulit (Butuh Akuntan)</span></td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> Sangat Mudah (Sistem Kasar & Cepat)</td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium">Program Afiliasi Recurring</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Kecil / Sekali Bayar</td>
                  <td className="p-4"><XCircle size={16} className="text-red-400 inline mr-2"/> Terbatas</td>
                  <td className="p-4 bg-emerald-500/5 font-bold text-emerald-400"><CheckCircle2 size={16} className="inline mr-2"/> 40% Lifetime Passive Income</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Roadmap Eksekusi */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Clock className="text-primary" /> Roadmap Eksekusi Pemasaran (3 Minggu Pertama)
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-slate-500" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                week: 1,
                title: 'Founder-Led Content',
                desc: 'Edukasi masif tentang bahayanya "Profit Bocor" dan pentingnya memisahkan uang pribadi vs bisnis.',
                colorClass: 'blue'
              },
              {
                week: 2,
                title: 'Afiliator Pionir',
                desc: 'Merekrut user awal yang puas untuk menjadi promotor pasif (menggunakan link afiliasi 40%).',
                colorClass: 'purple'
              },
              {
                week: 3,
                title: 'Gerilya Komunitas',
                desc: 'Infiltrasi grup WhatsApp, Facebook UMKM, dan komunitas pengusaha daerah.',
                colorClass: 'emerald'
              }
            ].map(weekConfig => {
              const weekTasks = getWeekTasks(weekConfig.week);
              const progress = calculateProgress(weekConfig.week);
              
              // Helper to get color classes based on the color string
              const getColorClasses = (color: string) => {
                if (color === 'blue') return { borderHover: 'hover:border-blue-500/50', text: 'text-blue-500', bg: 'bg-blue-500/20', textMuted: 'text-blue-400', progressBg: 'bg-blue-500' };
                if (color === 'purple') return { borderHover: 'hover:border-purple-500/50', text: 'text-purple-500', bg: 'bg-purple-500/20', textMuted: 'text-purple-400', progressBg: 'bg-purple-500' };
                return { borderHover: 'hover:border-emerald-500/50', text: 'text-emerald-500', bg: 'bg-emerald-500/20', textMuted: 'text-emerald-400', progressBg: 'bg-emerald-500' };
              };
              
              const colors = getColorClasses(weekConfig.colorClass);

              return (
                <div key={weekConfig.week} className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group transition-colors ${colors.borderHover}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                    <span className={`text-8xl font-black ${colors.text}`}>{weekConfig.week}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-block px-3 py-1 ${colors.bg} ${colors.textMuted} text-xs font-bold rounded-full`}>
                        Minggu {weekConfig.week}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{progress}% Done</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
                      <div className={`${colors.progressBg} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                    </div>

                    <h4 className="text-lg font-black text-white mb-2">{weekConfig.title}</h4>
                    <p className="text-sm text-slate-400 mb-6 h-16">{weekConfig.desc}</p>
                    
                    <div className="space-y-4">
                      {weekTasks.map(task => (
                        <div key={task.task_key} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
                          <div className="flex items-start gap-3 mb-3">
                            <button 
                              onClick={() => updateTask(task.id, task.task_key, { is_completed: !task.is_completed })}
                              className={`shrink-0 mt-0.5 rounded-full transition-colors ${task.is_completed ? colors.text : 'text-slate-600 hover:text-slate-400'}`}
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <p className={`text-xs ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                              {task.task_label}
                            </p>
                          </div>
                          
                          <div className="pl-8 space-y-3">
                            <div className="flex items-center gap-2">
                              <Target size={14} className="text-amber-400 shrink-0" />
                              <span className="text-xs font-bold text-amber-400">Target: {task.target_metric}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aktual:</span>
                              <input 
                                type="text" 
                                value={task.current_metric || ''}
                                onChange={(e) => {
                                  // Optimistic local update only, full save on blur
                                  setTasks(prev => prev.map(t => t.task_key === task.task_key ? { ...t, current_metric: e.target.value } : t));
                                }}
                                onBlur={(e) => updateTask(task.id, task.task_key, { current_metric: e.target.value })}
                                placeholder="0"
                                className="bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1 rounded w-full focus:outline-none focus:border-primary"
                              />
                            </div>
                            
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 block">Catatan / Link Bukti:</span>
                              <textarea 
                                value={task.notes || ''}
                                onChange={(e) => {
                                  setTasks(prev => prev.map(t => t.task_key === task.task_key ? { ...t, notes: e.target.value } : t));
                                }}
                                onBlur={(e) => updateTask(task.id, task.task_key, { notes: e.target.value })}
                                placeholder="https://..."
                                rows={2}
                                className="bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1.5 rounded w-full focus:outline-none focus:border-primary resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      
    </div>
  );
}
