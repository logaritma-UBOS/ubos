const fs = require('fs');

const categories = ['percetakan', 'ritel', 'jasa'];

for (const cat of categories) {
  const file = `src/app/ubos/${cat}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) continue;
  
  let code = fs.readFileSync(file, 'utf8');

  // Regex to remove fetchProducts
  code = code.replace(/const fetchProducts = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};\s*/, '');

  // Regex to remove filteredProducts
  code = code.replace(/const filteredProducts = products\.filter\([\s\S]*?\);\s*/, '');
  
  // Regex to remove confirmDelete
  code = code.replace(/const confirmDelete = async \(\) => \{[\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};\s*/, '');

  // Regex to remove toggleAvailability
  code = code.replace(/const toggleAvailability = async \([\s\S]*?toast\.error\('Gagal mengubah status ketersediaan'\);\s*\}\s*\};\s*/, '');
  
  // Regex to remove handleDeleteClick
  code = code.replace(/const handleDeleteClick = \([^)]*\) => \{\s*setItemToDelete\([^)]*\);\s*\};\s*/, '');

  // Save the cleaned code
  fs.writeFileSync(file, code);
  console.log(`Cleaned unused functions in ${file}`);
}
