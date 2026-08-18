const fs = require('fs');

const categories = ['percetakan', 'ritel', 'jasa'];

for (const cat of categories) {
  const file = `src/app/ubos/${cat}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) continue;
  
  let code = fs.readFileSync(file, 'utf8');

  // Regex to completely remove the rogue useEffect redirect block
  // It looks like:
  // useEffect(() => {
  //   router.push(`/ubos/${params.category || 'percetakan'}/${params.slug}/inventory`);
  // }, []);
  
  const regex = /useEffect\(\(\) => \{\s*router\.push\(`\/ubos\/\$\{params\.category \|\| '[^']+'\}\/\$\{params\.slug\}\/inventory`\);\s*\}, \[\]\);/g;
  
  code = code.replace(regex, '');

  fs.writeFileSync(file, code);
  console.log(`Removed rogue redirect useEffect from ${file}`);
}
