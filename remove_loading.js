const fs = require('fs');

const categories = ['percetakan', 'ritel', 'jasa'];

for (const cat of categories) {
  const file = `src/app/ubos/${cat}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) continue;
  
  let code = fs.readFileSync(file, 'utf8');

  // Remove the loading state declaration
  code = code.replace(/const \[loading, setLoading\] = useState\(true\);\s*/g, '');

  // Remove the loading spinner block
  // It looks like:
  // if (loading) {
  //   return (
  //     <div className="p-4 flex items-center justify-center h-full min-h-[50vh]">
  //       <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
  //     </div>
  //   );
  // }
  const regex = /if \(loading\) \{[\s\S]*?return \([\s\S]*?<div className="animate-spin[\s\S]*?<\/div>[\s\S]*?<\/div>\s*\);\s*\}\s*/g;
  code = code.replace(regex, '');

  fs.writeFileSync(file, code);
  console.log(`Removed loading state from ${file}`);
}
