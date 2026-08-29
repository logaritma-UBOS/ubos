const fs = require('fs');
let act = fs.readFileSync('src/app/admin/pilot/activation/page.tsx', 'utf8');

let occurrences = 0;
while (act.includes('style={{ width: ${}% }}')) {
    occurrences++;
    let rep = '';
    if (occurrences === 1) rep = "style={{ width: '100%' }}";
    if (occurrences === 2) rep = "style={{ width: `${rateBusiness}%` }}";
    if (occurrences === 3) rep = "style={{ width: `${rateData}%` }}";
    if (occurrences === 4) rep = "style={{ width: `${rateCore}%` }}";
    act = act.replace('style={{ width: ${}% }}', rep);
}

fs.writeFileSync('src/app/admin/pilot/activation/page.tsx', act);
console.log('Fixed');
