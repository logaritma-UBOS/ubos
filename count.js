const fs = require('fs');
const code = fs.readFileSync('src/app/ubos/percetakan/[slug]/inventory/new/page.tsx', 'utf8');
const start = code.indexOf('return (\\n    <>');
const retCode = code.slice(start);
const openDivs = (retCode.match(/<div\\b[^>]*>/g) || []).length;
const closeDivs = (retCode.match(/<\\/div>/g) || []).length;
console.log('Open:', openDivs, 'Close:', closeDivs);
