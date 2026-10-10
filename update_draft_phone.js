const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');
code = code.replace(
  'draftName           String?',
  'draftName           String?\n  draftPhone          String?'
);
fs.writeFileSync('prisma/schema.prisma', code);

let code2 = fs.readFileSync('run_turso_mig.js', 'utf8');
code2 = code2.replace(
  'try { await client.execute(\'ALTER TABLE "Sale" ADD COLUMN "draftName" TEXT\'); } catch(e) {}',
  'try { await client.execute(\'ALTER TABLE "Sale" ADD COLUMN "draftName" TEXT\'); } catch(e) {}\n    try { await client.execute(\'ALTER TABLE "Sale" ADD COLUMN "draftPhone" TEXT\'); } catch(e) {}'
);
fs.writeFileSync('run_turso_mig.js', code2);
console.log('Schema and DB script updated for draftPhone');
