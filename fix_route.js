const fs = require('fs');
const file = 'src/app/api/cron/wa-alerts/route.ts';
let content = fs.readFileSync(file, 'utf8');

const oldBaim = `const baim = teamMembers.find(m => m.name.toLowerCase().includes("baim"));`;
const newBaim = `const baim = teamMembers.find(m => m.name.toLowerCase().includes("baim") || m.email === "logaritma.tim@gmail.com");`;

content = content.replace(oldBaim, newBaim);
fs.writeFileSync(file, content);
console.log('Fixed Route.ts email match!');
