const fs = require('fs');
let layout = fs.readFileSync('src/app/admin/pilot/(dashboard)/layout.tsx', 'utf8');

// The corrupted character might look weird, so let's just use regex to replace it
// Let's replace the whole list item for developer
layout = layout.replace(/<Link href="\/admin\/pilot\/developer"[\s\S]*?<\/li>/, 
    `<Link href="/admin/pilot/developer" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all duration-200 font-medium">
                  <span>\uD83D\uDEE1\uFE0F</span> Developer Guard
                </Link>
              </li>`);

fs.writeFileSync('src/app/admin/pilot/(dashboard)/layout.tsx', layout, 'utf8');
console.log("Fixed layout.tsx");
