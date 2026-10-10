const fs = require('fs');
let layout = fs.readFileSync('src/app/admin/pilot/(dashboard)/layout.tsx', 'utf8');

const targetStr = `Integrasi WA Pribadi\n                </Link>\n              </li>\n            </ul>\n          </div>`;
const replaceStr = `Integrasi WA Pribadi\n                </Link>\n              </li>\n              <li>\n                <Link href="/admin/pilot/developer" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all duration-200 font-medium">\n                  <span>???</span> Developer Guard\n                </Link>\n              </li>\n            </ul>\n          </div>`;

if (layout.includes('Integrasi WA Pribadi') && !layout.includes('Developer Guard')) {
    layout = layout.replace(targetStr, replaceStr);
    fs.writeFileSync('src/app/admin/pilot/(dashboard)/layout.tsx', layout, 'utf8');
    console.log("Added Developer link to sidebar");
} else {
    console.log("Already added or couldn't find target string");
}
