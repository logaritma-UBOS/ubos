const fs = require('fs');
['src/app/page.tsx', 'src/app/inventory/page.tsx', 'src/app/inventory/new/page.tsx', 'src/app/inventory/edit/[id]/page.tsx', 'src/app/finance/page.tsx', 'src/app/crm/page.tsx', 'src/app/settings/page.tsx', 'src/app/pos/page.tsx'].forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    // Add h-[80px] to header class if it's not already there
    if (!content.includes('h-[80px]')) {
      content = content.replace(/header className="fixed top-0 z-40 bg-primary/g, 'header className="fixed top-0 z-40 h-[80px] bg-primary');
      fs.writeFileSync(f, content);
      console.log('Fixed h-[80px] for ' + f);
    }
  } catch(e) {
    console.log('Err ' + f + ': ' + e.message);
  }
});
