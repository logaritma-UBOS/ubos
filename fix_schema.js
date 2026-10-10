const fs = require('fs');
const file = 'prisma/schema.prisma';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'campaignId          String?',
  'campaignId          String?\n  status              String     @default("COMPLETED") // DRAFT, COMPLETED\n  draftName           String?'
);

fs.writeFileSync(file, code);
console.log('Schema updated');
