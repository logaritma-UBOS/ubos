const fs = require('fs');
['src/app/page.tsx', 'src/app/inventory/page.tsx', 'src/app/pos/page.tsx', 'src/app/finance/page.tsx', 'src/app/crm/page.tsx', 'src/app/settings/page.tsx'].forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    const match = content.match(/<header className="([^"]+)"/);
    if (match) console.log(f + ':\n' + match[1]);
  } catch(e) {}
});
