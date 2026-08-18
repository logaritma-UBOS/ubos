const fs = require('fs');

function patchNewSafe(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Remove the entire product list section but keep the closing container div
  let startIdx = code.indexOf('{/* Product List Section */}');
  if (startIdx === -1) startIdx = code.indexOf('{/* Product List */}');
  if (startIdx === -1) startIdx = code.indexOf('<div className="mt-6">');
  if (startIdx === -1) startIdx = code.indexOf('<div className="flex items-center justify-between mb-4">');

  if (startIdx !== -1) {
    const endIdx = code.lastIndexOf('</>');
    if (endIdx !== -1 && endIdx > startIdx) {
      code = code.substring(0, startIdx) + '      </div>\n    ' + code.substring(endIdx);
    }
  }

  // 2. Replace fetchProducts() with router.push (if not already done)
  code = code.replace(/fetchProducts\(\);/g, "router.push(`/ubos/${params.category || '" + category + "'}/${params.slug}/inventory`);");
  
  // 3. Remove unused state that causes ReferenceError
  code = code.replace(/const \[products, setProducts\].*?;/, "");
  code = code.replace(/const \[searchQuery, setSearchQuery\].*?;/, "");
  
  // 4. Also remove the Delete Modal state if it's there
  code = code.replace(/const \[itemToDelete, setItemToDelete\].*?;/, "");

  // 5. Replace header if it hasn't been replaced yet
  if (!code.includes('Tambah Produk Baru')) {
    const oldHeaderRegex = /<header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">.*?<\/header>/s;
    const newHeader = `
          {/* Header Inventory - Modern Clean */}
          <header className="px-5 py-6 md:py-8 flex justify-between items-center z-10 relative bg-slate-50">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center flex-wrap gap-3">
                Tambah Produk Baru
                <HeaderAiTrigger />
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium">
                Tambah item kalkulator HPP baru
              </p>
            </div>
            <Link 
              href={\`/ubos/\${params.category || '${category}'}/\${params.slug}/inventory\`}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </header>`;
    code = code.replace(oldHeaderRegex, newHeader);

    // Add ArrowLeft to lucide-react imports if not present
    if (!code.includes('ArrowLeft')) {
      code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { ArrowLeft, $1 } from 'lucide-react';");
    }
    
    // Also add Link import if not present
    if (!code.includes("import Link from 'next/link';")) {
      code = code.replace("import { toast }", "import Link from 'next/link';\nimport { toast }");
    }
  }

  fs.writeFileSync(file, code);
  console.log(`Safely patched ${file}`);
}

['percetakan', 'ritel', 'jasa'].forEach(cat => patchNewSafe(cat));
