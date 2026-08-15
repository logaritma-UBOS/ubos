const fs = require('fs');

const files = [
  'src/app/ubos/[category]/[slug]/affiliate/page.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix Header Gradient
  content = content.replace(
    /className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white p-6 md:p-10 pb-16 rounded-b-\[2rem\] shadow-xl relative overflow-hidden"/g,
    'className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 md:p-10 pb-16 rounded-b-3xl md:rounded-b-[2rem] shadow-xl relative overflow-hidden"'
  );

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
}
