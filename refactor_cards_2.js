const fs = require('fs');

const lines = fs.readFileSync('src/app/app/page.tsx', 'utf8').split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{isKuliner && (') && startIdx === -1) {
        startIdx = i;
    }
    if (lines[i].includes('{/* C. Support System & Services Logaritma */}')) {
        endIdx = i;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const cardsBlock = lines.slice(startIdx, endIdx - 1);
    const newBlock = cardsBlock.map(line => {
        let newLine = line;
        newLine = newLine.replace('{isKuliner && (', '{!isKuliner && (');
        newLine = newLine.replace('{isPercetakan && (', '{!isPercetakan && (');
        newLine = newLine.replace('{isRitel && (', '{!isRitel && (');
        newLine = newLine.replace('{isLaundry && (', '{!isLaundry && (');
        newLine = newLine.replace('{isLainnya && (', '{!isLainnya && (');
        return newLine;
    });

    const eksplorasiHeader = [
        '',
        '        {/* Eksplorasi Modul Lain */}',
        '        <div className="space-y-6 pt-6 border-t border-slate-200">',
        '          <div className="flex items-center justify-between">',
        '            <div>',
        '              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Eksplorasi Modul Lain</h2>',
        '              <p className="text-slate-500 font-medium">Lihat dan daftar prioritas untuk modul kategori bisnis lainnya.</p>',
        '            </div>',
        '          </div>',
        '          <div className="grid md:grid-cols-1 gap-6">'
    ];

    const eksplorasiFooter = [
        '          </div>',
        '        </div>',
        ''
    ];

    const newLines = [
        ...lines.slice(0, endIdx),
        ...eksplorasiHeader,
        ...newBlock,
        ...eksplorasiFooter,
        ...lines.slice(endIdx)
    ];

    fs.writeFileSync('src/app/app/page.tsx', newLines.join('\n'));
    console.log('Refactoring Node done.');
} else {
    console.log('Failed to find boundaries');
}
