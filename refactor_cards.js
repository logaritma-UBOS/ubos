const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the start of the cards
const kulinerMatch = content.match(/\{\s*isKuliner\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/);
const percetakanMatch = content.match(/\{\s*isPercetakan\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/);
const ritelMatch = content.match(/\{\s*isRitel\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/);
const laundryMatch = content.match(/\{\s*isLaundry\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/);
const lainnyaMatch = content.match(/\{\s*isLainnya\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/);

const replaceBlock = (content, regex, fnName, matchContent) => {
  return content.replace(regex, `{${fnName}()}`);
}

let newContent = content;
newContent = replaceBlock(newContent, /\{\s*isKuliner\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/, 'isKuliner && renderKulinerCard');
newContent = replaceBlock(newContent, /\{\s*isPercetakan\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/, 'isPercetakan && renderPercetakanCard');
newContent = replaceBlock(newContent, /\{\s*isRitel\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/, 'isRitel && renderRitelCard');
newContent = replaceBlock(newContent, /\{\s*isLaundry\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/, 'isLaundry && renderLaundryCard');
newContent = replaceBlock(newContent, /\{\s*isLainnya\s*&&\s*\(\s*([\s\S]*?)\s*\)\s*\}/, 'isLainnya && renderLainnyaCard');

const renderFunctions = `
  const renderKulinerCard = () => (
    ${kulinerMatch[1]}
  );

  const renderPercetakanCard = () => (
    ${percetakanMatch[1]}
  );

  const renderRitelCard = () => (
    ${ritelMatch[1]}
  );

  const renderLaundryCard = () => (
    ${laundryMatch[1]}
  );

  const renderLainnyaCard = () => (
    ${lainnyaMatch[1]}
  );
`;

// Insert the render functions before the return statement
newContent = newContent.replace('  return (', renderFunctions + '\n  return (');

const eksplorasiSection = `

        {/* B2. Eksplorasi Modul Lain */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Eksplorasi Modul Lain</h2>
              <p className="text-slate-500 font-medium">Lihat dan daftar prioritas untuk modul kategori bisnis lainnya.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-1 gap-6">
            {!isKuliner && renderKulinerCard()}
            {!isPercetakan && renderPercetakanCard()}
            {!isRitel && renderRitelCard()}
            {!isLaundry && renderLaundryCard()}
          </div>
        </div>`;

const supportSystemRegex = /          <\/div>\s*<\/div>\s*\{\/\* C\. Support System & Services Logaritma \*\/\}/;
newContent = newContent.replace(supportSystemRegex, `          </div>\n        </div>${eksplorasiSection}\n\n        {/* C. Support System & Services Logaritma */}`);


fs.writeFileSync(filePath, newContent);
console.log('Refactoring complete.');
