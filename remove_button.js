const fs = require('fs');
const file = 'src/app/(dashboard)/marketing/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex-1 flex justify-between items-center">[\s\S]*?<h1 className="text-2xl font-bold text-gray-900">Marketing Engine<\/h1>[\s\S]*?\{isVip \? \([\s\S]*?<Link href="\/pengaturan\/whatsapp"[\s\S]*?<\/Link>[\s\S]*?\) : \([\s\S]*?<LockedWaButton \/>[\s\S]*?\)\]?\s*\}[\s\S]*?<\/div>/m;

const newHeader = `<div className="flex-1 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Marketing Engine</h1>
            </div>`;

if (regex.test(content)) {
    content = content.replace(regex, newHeader);
    fs.writeFileSync(file, content);
    console.log('Successfully removed Integrasi WA button from Marketing page!');
} else {
    console.log('Regex did not match for Marketing page.');
}
