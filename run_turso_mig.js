const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Use process.env directly during Vercel build
const dbUrl = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || dbUrl.includes('[SENSITIVE]')) {
    console.log('Skipping migrations: DATABASE_URL not available (likely local or sensitive pull).');
    process.exit(0);
}

const client = createClient({ url: dbUrl, authToken });

async function migrate() {
    const migs = [
        '20260821025633_phase1_unified_item',
        '20260821030025_phase1_fix_default',
        '20260821032057_phase3_hpp_engine',
        '20260821155410_phase4d_receipt',
        '20260822005400_promo_engine',
        '20260822114400_content_planner',
        '20260822123000_campaign',
        '20260822171000_wa_fonnte',
        '20260826123000_nextauth',
        '20260829000000_owner_backend',
        '20260829000001_owner_action_fields',
        '20260829000002_owner_marketing',
  '20260830000000_final_learning_loop'
    ];

    for (const m of migs) {
        console.log('Running migration:', m);
        const p = path.join(process.cwd(), 'prisma', 'migrations', m, 'migration.sql');
        if (!fs.existsSync(p)) {
            console.log('File not found:', p);
            continue;
        }
        const sql = fs.readFileSync(p, 'utf8');
        const stmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const s of stmts) {
            try {
                await client.execute(s);
            } catch (e) {
                if (e.message.includes('duplicate column')) {
                    console.log('Already applied (duplicate column)');
                } else if (e.message.includes('already exists')) {
                    console.log('Already applied (table exists)');
                } else {
                    console.error('Error on statement:', s);
                    console.error(e.message);
                }
            }
        }
    }
    console.log('Done.');
}
migrate().catch(console.error);