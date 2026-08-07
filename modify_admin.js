const fs = require('fs');

// 1. Update src/app/page.tsx
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldHandleRegister = `  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.category !== "Kuliner & F&B") {
      setShowModal(false);
      setShowDevPopup(true);
      return;
    }

    setLoading(true);

    try {
      let cleanWA = formData.whatsapp.replace(/\\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.slice(1);
      else if (cleanWA.startsWith('8')) cleanWA = '62' + cleanWA;
      
      const { data: existingWa } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/member/login');
        return;
      }

      const leadData = {
        nama_usaha: formData.merchantName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));
      localStorage.setItem('ubos_temp_pass', formData.password);

      await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead'
        }
      ]);
      
      toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
      setShowModal(false);
      router.push(\`/ubos\`);
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };`;

const newHandleRegister = `  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let cleanWA = formData.whatsapp.replace(/\\D/g, '');
      if (cleanWA.length < 10) {
        throw new Error("Nomor WhatsApp tidak valid. Minimal 10 digit.");
      }
      if (cleanWA.startsWith('0')) cleanWA = '62' + cleanWA.slice(1);
      else if (cleanWA.startsWith('8')) cleanWA = '62' + cleanWA;
      
      const { data: existingWa } = await supabase
        .from('merchants')
        .select('id')
        .eq('whatsapp', cleanWA)
        .maybeSingle();

      if (existingWa) {
        toast.error("Nomor WhatsApp ini sudah terdaftar. Silakan login untuk melanjutkan.");
        router.push('/auth');
        return;
      }

      const isFnB = formData.category === "Kuliner & F&B";
      const funnelDest = isFnB ? 'UBOS' : 'MEMBER_AREA';

      const leadData = {
        nama_usaha: formData.merchantName,
        whatsapp: cleanWA,
        kategori_usaha: formData.category,
      };
      
      localStorage.setItem('ubos_lead', JSON.stringify(leadData));
      if (isFnB) {
        localStorage.setItem('ubos_temp_pass', formData.password);
      }

      // Record to Leads Database with new schema fields
      await supabase.from('leads').insert([
        {
          nama_usaha: formData.merchantName,
          no_wa: cleanWA,
          kategori: formData.category,
          status: 'New Lead',
          password_session: formData.password,
          funnel_destination: funnelDest
        }
      ]);
      
      setShowModal(false);

      if (isFnB) {
        toast.success("Berhasil! Mengalihkan ke Dashboard UBOS...");
        router.push(\`/ubos\`);
      } else {
        setShowDevPopup(true);
      }
      
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };`;
pageCode = pageCode.replace(oldHandleRegister, newHandleRegister);
fs.writeFileSync('src/app/page.tsx', pageCode);

// 2. Update src/app/admin/page.tsx
let adminCode = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Replace state and query logic
const oldAdminState = `  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    registerClicks: 0,
    whatsappClicks: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: merchantData },
        { data: txData },
        { count: totalVisitors },
        { count: registerClicks },
        { count: waClicks },
      ] = await Promise.all([
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_transactions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_cta_register'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_wa_consultation'),
      ]);
      if (merchantData) setMerchants(merchantData);
      if (txData) setTransactions(txData);
      setAnalyticsData({
        totalVisitors: totalVisitors ?? 0,
        registerClicks: registerClicks ?? 0,
        whatsappClicks: waClicks ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);`;

const newAdminState = `  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    registerClicks: 0,
    whatsappClicks: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: merchantData },
        { data: txData },
        { data: leadsData },
        { count: totalVisitors },
        { count: registerClicks },
        { count: waClicks },
      ] = await Promise.all([
        supabase.from('merchants').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_transactions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_cta_register'),
        supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click_wa_consultation'),
      ]);
      if (merchantData) setMerchants(merchantData);
      if (txData) setTransactions(txData);
      if (leadsData) setLeads(leadsData);
      setAnalyticsData({
        totalVisitors: totalVisitors ?? 0,
        registerClicks: registerClicks ?? 0,
        whatsappClicks: waClicks ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);`;

adminCode = adminCode.replace(oldAdminState, newAdminState);

// Replace metrics mapping
const oldMetrics = `  const metrics = useMemo(() => {
    let active = 0, vvip = 0, expired = 0, today = 0;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    merchants.forEach(m => {
      const exp = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      const isVVIP = exp > now + 3000 * 24 * 60 * 60 * 1000;
      if (isVVIP) vvip++;
      else if (exp > now) active++;
      else expired++;
      if (m.last_active_at && new Date(m.last_active_at).getTime() >= startOfToday.getTime()) today++;
    });
    return { total: merchants.length, active, vvip, expired, today };
  }, [merchants, now]);`;

const newMetrics = `  const metrics = useMemo(() => {
    let active = 0, vvip = 0, expired = 0, today = 0;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    merchants.forEach(m => {
      const exp = m.trial_expires_at ? new Date(m.trial_expires_at).getTime() : 0;
      const isVVIP = exp > now + 3000 * 24 * 60 * 60 * 1000;
      if (isVVIP) vvip++;
      else if (exp > now) active++;
      else expired++;
      if (m.last_active_at && new Date(m.last_active_at).getTime() >= startOfToday.getTime()) today++;
    });
    return { total: merchants.length, active, vvip, expired, today };
  }, [merchants, now]);

  const leadsMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const ubosFnb = leads.filter(l => l.funnel_destination === 'UBOS' || l.kategori?.includes('Kuliner')).length;
    const memberArea = leads.filter(l => l.funnel_destination === 'MEMBER_AREA' || (!l.kategori?.includes('Kuliner') && l.funnel_destination)).length;
    
    const catCount = {
      'Kuliner & F&B': 0,
      'Percetakan': 0,
      'Ritel': 0,
      'Jasa / Lainnya': 0
    };
    
    leads.forEach(l => {
      if (catCount[l.kategori] !== undefined) catCount[l.kategori]++;
      else if (l.kategori?.includes('Kuliner')) catCount['Kuliner & F&B']++;
      else catCount['Jasa / Lainnya']++;
    });
    
    return { totalLeads, ubosFnb, memberArea, catCount };
  }, [leads]);
  
  const filteredLeads = useMemo(() => {
    if (categoryFilter === 'All') return leads;
    if (categoryFilter === 'Kuliner') return leads.filter(l => l.kategori?.includes('Kuliner'));
    return leads.filter(l => l.kategori === categoryFilter);
  }, [leads, categoryFilter]);`;

adminCode = adminCode.replace(oldMetrics, newMetrics);

// Update Dashboard Grid Stats
const oldStatsGrid = `      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Merchants', value: metrics.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Trial Aktif', value: metrics.active, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Premium (VVIP)', value: metrics.vvip, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Aktif Hari Ini', value: metrics.today, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s, i) => (
          <div key={i} className={\`p-5 rounded-2xl border \${s.bg}\`}>
            <s.icon size={20} className={\`\${s.color} mb-3\`} />
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>`;

const newStatsGrid = `      {/* Leads Funnel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {[
          { label: 'Total Pendaftar Baru', desc: 'Landing Page Leads', value: leadsMetrics.totalLeads, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pengguna UBOS F&B', desc: 'Direct ke /ubos', value: leadsMetrics.ubosFnb, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Waitlist Non-F&B', desc: 'Direct ke Member Area', value: leadsMetrics.memberArea, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((s, i) => (
          <div key={i} className={\`p-5 rounded-2xl border \${s.bg} flex items-start justify-between\`}>
            <div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-slate-300 font-bold mt-1">{s.label}</p>
              <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
            </div>
            <s.icon size={24} className={\`\${s.color}\`} />
          </div>
        ))}
      </div>
      
      {/* Kategori Breakdown */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 md:p-6 mb-8">
        <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest text-slate-400">Distribusi Kategori Usaha</h3>
        <div className="flex flex-wrap gap-2 md:gap-4">
          {Object.entries(leadsMetrics.catCount).map(([cat, count]) => {
            const pct = leadsMetrics.totalLeads > 0 ? Math.round((count / leadsMetrics.totalLeads) * 100) : 0;
            return (
              <div key={cat} className="flex-1 min-w-[120px] bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 font-bold mb-1 truncate">{cat}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-black text-white">{count}</p>
                  <p className="text-xs text-blue-400 font-bold">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="text-xl font-black text-white mt-8 mb-4">Merchants Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Merchants', value: metrics.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Trial Aktif', value: metrics.active, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Premium (VVIP)', value: metrics.vvip, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Aktif Hari Ini', value: metrics.today, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s, i) => (
          <div key={i} className={\`p-5 rounded-2xl border \${s.bg}\`}>
            <s.icon size={20} className={\`\${s.color} mb-3\`} />
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>`;

adminCode = adminCode.replace(oldStatsGrid, newStatsGrid);

// Append Leads Table at the end
const adminEnd = `      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-2">
              <DollarSign size={18} className="text-amber-400" /> Transaksi Terbaru
            </h3>
            <Link href="/admin/finance" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-200">{tx.category}</p>
                  <p className="text-xs text-slate-500">{tx.description || '-'} · {tx.transaction_date}</p>
                </div>
                <p className={\`font-black text-sm \${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}\`}>
                  {tx.type === 'IN' ? '+' : '-'}{fmt(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;

const adminLeadsTable = `      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-2">
              <DollarSign size={18} className="text-amber-400" /> Transaksi Terbaru
            </h3>
            <Link href="/admin/finance" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-bold text-slate-200">{tx.category}</p>
                  <p className="text-xs text-slate-500">{tx.description || '-'} · {tx.transaction_date}</p>
                </div>
                <p className={\`font-black text-sm \${tx.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}\`}>
                  {tx.type === 'IN' ? '+' : '-'}{fmt(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel Data Leads / Users */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 mt-8 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-black text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" /> Database Registrasi Pendaftar
          </h3>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-blue-500 font-bold"
          >
            <option value="All">Semua Kategori</option>
            <option value="Kuliner">Kuliner & F&B</option>
            <option value="Percetakan">Percetakan</option>
            <option value="Ritel">Ritel</option>
            <option value="Jasa / Lainnya">Jasa / Lainnya</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-500 font-black">
              <tr>
                <th className="px-6 py-4">Nama Usaha / Toko</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Kategori Usaha</th>
                <th className="px-6 py-4">Status Funnel</th>
                <th className="px-6 py-4">Waktu Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.slice(0, 50).map((lead, i) => (
                <tr key={lead.id || i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{lead.nama_usaha || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={\`https://wa.me/\${lead.no_wa}\`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      +{lead.no_wa}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2.5 py-1 rounded-md text-[10px] font-black uppercase \${
                      lead.kategori?.includes('Kuliner') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      lead.kategori?.includes('Percetakan') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      lead.kategori?.includes('Ritel') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-700 text-slate-300 border border-slate-600'
                    }\`}>
                      {lead.kategori || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 \${
                      lead.funnel_destination === 'UBOS' || lead.kategori?.includes('Kuliner') 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-indigo-500/10 text-indigo-400'
                    }\`}>
                      {lead.funnel_destination === 'UBOS' || lead.kategori?.includes('Kuliner') ? <CheckCircle2 size={12}/> : <Activity size={12}/>}
                      {lead.funnel_destination || (lead.kategori?.includes('Kuliner') ? 'UBOS' : 'MEMBER_AREA')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                    Belum ada data pendaftar untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredLeads.length > 50 && (
             <div className="p-4 text-center border-t border-slate-800 text-xs text-slate-500">
               Menampilkan 50 data terbaru.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

adminCode = adminCode.replace(adminEnd, adminLeadsTable);
fs.writeFileSync('src/app/admin/page.tsx', adminCode);

console.log("Admin changes written successfully!");
