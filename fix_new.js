const fs = require('fs');

function fixNewPage(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // We need to delete everything from {/* Product List Section */} down to but NOT including </>\n  );\n}
  // Wait, better to find the index of {/* Product List Section */} (or similar) and chop it off
  let startIdx = code.indexOf('{/* Product List Section */}');
  if (startIdx === -1) startIdx = code.indexOf('{/* Product List */}');
  if (startIdx === -1) startIdx = code.indexOf('<div className="mt-6">');
  if (startIdx === -1) startIdx = code.indexOf('<div className="flex items-center justify-between mb-4">');

  if (startIdx !== -1) {
    // Find the end of the return statement
    const endIdx = code.lastIndexOf('</>');
    if (endIdx !== -1 && endIdx > startIdx) {
      code = code.substring(0, startIdx) + '      ' + code.substring(endIdx);
      fs.writeFileSync(file, code);
      console.log(`Fixed ${category}`);
    }
  }
}

['percetakan', 'ritel', 'jasa'].forEach(cat => fixNewPage(cat));
