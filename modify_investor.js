const fs = require('fs');

// 1. Update src/app/investor/page.tsx
let invCode = fs.readFileSync('src/app/investor/page.tsx', 'utf8');

const oldFetchFunding = `  useEffect(() => {
    const fetchFunding = async () => {
      try {
        // Jalankan semua query secara paralel
        const [
          { data: fundingItemsData },
          { data: capTxData },
          { data: cashTxData },
        ] = await Promise.all([
          supabase.from('funding_items').select('title, is_funded, price'),
          supabase.from('capital_transactions').select('deskripsi, nominal').eq('tipe', 'INFLOW'),
          supabase.from('cash_transactions').select('description, amount, category').eq('type', 'IN'),
        ]);

        // Kumpulkan semua title yang terfunded dari SEMUA sumber (union)
        const fundedTitles = new Set<string>();

        // ── Sumber 1: funding_items.is_funded (paling akurat) ──────────────
        if (fundingItemsData) {
          fundingItemsData.forEach(f => {
            if (f.is_funded) fundedTitles.add(f.title);
          });
        }

        // ── Sumber 2: capital_transactions (INFLOW dari webhook/admin) ──────
        if (capTxData) {
          capTxData.forEach(tx => {
            const matchedTitle = Object.values(ITEM_ID_MAP).find(t => (tx.deskripsi || '').includes(t));
            if (matchedTitle) fundedTitles.add(matchedTitle);
          });
        }

        // ── Sumber 3: cash_transactions (legacy manual injection) ────────────
        if (cashTxData) {
          cashTxData.forEach(tx => {
            const isInvestorTx = tx.category === 'Inject Modal Investor' || tx.category === 'Modal Investor';
            if (isInvestorTx) {
              const matchedTitle = Object.values(ITEM_ID_MAP).find(t => (tx.description || '').includes(t));
              if (matchedTitle) fundedTitles.add(matchedTitle);
            }
          });
        }

        // Map funded titles → item IDs
        const funded = FUNDING_ITEMS.filter(item =>
          fundedTitles.has(ITEM_ID_MAP[item.id])
        ).map(i => i.id);

        // ── Hitung terkumpul dari HARGA ITEM yang terfunded ──────────────────
        // Ini adalah satu-satunya sumber kebenaran — konsisten, tidak double count
        const terkumpul = FUNDING_ITEMS
          .filter(item => funded.includes(item.id))
          .reduce((acc, item) => acc + item.price, 0);

        setFundedItems(funded);
        setAccumulatedFund(terkumpul);
        // Hanya pilih item yang belum terfunded untuk checkout baru
        setSelectedItems(FUNDING_ITEMS.filter(i => !funded.includes(i.id)).map(i => i.id));

      } catch (err) {
        console.error('Failed to fetch funding data', err);
      }
    };

    fetchFunding();
  }, []);`;

const newFetchFunding = `  useEffect(() => {
    const fetchFunding = async () => {
      try {
        const [
          { data: fundingItemsData },
          { data: cashTxData },
        ] = await Promise.all([
          supabase.from('funding_items').select('title, is_funded, price'),
          supabase.from('cash_transactions').select('description, amount, category').eq('type', 'IN').eq('category', 'Inject Modal Investor'),
        ]);

        // Set UI Checklist for funded items (hanya untuk tampilan visual centang)
        const fundedTitles = new Set<string>();
        if (fundingItemsData) {
          fundingItemsData.forEach(f => {
            if (f.is_funded) fundedTitles.add(f.title);
          });
        }
        
        // Cek juga dari deskripsi transaksi barangkali ada item yg didanai parsial
        if (cashTxData) {
          cashTxData.forEach(tx => {
            const matchedTitle = Object.values(ITEM_ID_MAP).find(t => (tx.description || '').includes(t));
            if (matchedTitle) fundedTitles.add(matchedTitle);
          });
        }

        const funded = FUNDING_ITEMS.filter(item =>
          fundedTitles.has(ITEM_ID_MAP[item.id])
        ).map(i => i.id);
        
        setFundedItems(funded);
        setSelectedItems(FUNDING_ITEMS.filter(i => !funded.includes(i.id)).map(i => i.id));

        // ── REAL TIME TERKUMPUL DARI TRANSAKSI KAS ──────────────────
        // Single source of truth untuk angka rupiah
        let totalTerkumpul = 0;
        if (cashTxData) {
          totalTerkumpul = cashTxData.reduce((acc, tx) => acc + Number(tx.amount), 0);
        }
        setAccumulatedFund(totalTerkumpul);

      } catch (err) {
        console.error('Failed to fetch funding data', err);
      }
    };

    fetchFunding();
  }, []);`;
  
invCode = invCode.replace(oldFetchFunding, newFetchFunding);
fs.writeFileSync('src/app/investor/page.tsx', invCode);

// 2. Update Webhook src/app/api/mayar/webhook/route.ts
let webhookCode = fs.readFileSync('src/app/api/mayar/webhook/route.ts', 'utf8');

const oldWebhookInsert = `      // 2. Insert ke capital_transactions (tipe INFLOW) ───────────────────
      const desc = \`Pendanaan Investor: \${itemNames || itemIds.join(', ')}\`;
      const { error: txErr } = await supabaseAdmin.from('capital_transactions').insert([{
        tipe:       'INFLOW',
        kategori:   'Modal Investor',
        nominal:    amount,
        deskripsi:  desc,
        nama:       name,
        email:      email,
        created_at: new Date().toISOString(),
      }]);
      if (txErr) {
        // Fallback ke cash_transactions jika capital_transactions belum ada
        await supabaseAdmin.from('cash_transactions').insert([{
          transaction_date: new Date().toISOString().split('T')[0],
          type:        'IN',
          category:    'Inject Modal Investor',
          description: desc,
          amount:      amount,
        }]);
      }`;
      
const newWebhookInsert = `      // 2. Insert UTAMA ke cash_transactions agar sinkron dengan Finance Dashboard
      const desc = \`Pendanaan Investor: \${itemNames || itemIds.join(', ')}\`;
      
      const { error: cashTxErr } = await supabaseAdmin.from('cash_transactions').insert([{
        transaction_date: new Date().toISOString().split('T')[0],
        type:        'IN',
        category:    'Inject Modal Investor',
        description: desc,
        amount:      amount,
      }]);
      
      if (cashTxErr) console.error('cash_transactions insert error:', cashTxErr);
      
      // Catat juga ke capital_transactions sebagai log duplikat/histori spesifik investor
      await supabaseAdmin.from('capital_transactions').insert([{
        tipe:       'INFLOW',
        kategori:   'Modal Investor',
        nominal:    amount,
        deskripsi:  desc,
        nama:       name,
        email:      email,
        created_at: new Date().toISOString(),
      }]);`;

webhookCode = webhookCode.replace(oldWebhookInsert, newWebhookInsert);
fs.writeFileSync('src/app/api/mayar/webhook/route.ts', webhookCode);

console.log("Finance and Investor Sync Completed!");
