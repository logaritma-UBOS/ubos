const fs = require('fs');
const file = 'src/app/(dashboard)/pelanggan/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<AddCustomerButton \/>`n            <ImportContactsModal \/>/g, '<div className="flex items-center gap-2">\n<AddCustomerButton />\n<ImportContactsModal />\n</div>');

fs.writeFileSync(file, content);
