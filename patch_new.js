const fs = require('fs');

function patchNewPage(category) {
  const file = `src/app/ubos/${category}/[slug]/inventory/new/page.tsx`;
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Add ArrowLeft to lucide-react imports if not present
  if (!code.includes('ArrowLeft')) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { ArrowLeft, $1 } from 'lucide-react';");
  }
  
  // Also add Link import if not present
  if (!code.includes("import Link from 'next/link';")) {
    code = code.replace("import { toast }", "import Link from 'next/link';\nimport { toast }");
  }

  // 1. Replace the header
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

  // 2. Replace the fetchProducts redirect with router.push
  code = code.replace(/fetchProducts\(\);/g, "router.push(`/ubos/${params.category || '" + category + "'}/${params.slug}/inventory`);");
  
  // 3. Remove the entire Daftar Produk section (from Daftar Produk to Custom Delete Modal)
  const daftarProdukRegex = /\{\/\*\s*Product List\s*\*\/\}.*?(?=\{\/\*\s*Custom Delete Modal\s*\*\/\})/s;
  if (daftarProdukRegex.test(code)) {
    code = code.replace(daftarProdukRegex, "");
  } else {
     // Alternative regex if it doesn't have the exact Product List comment
     const daftarProdukAlternative = /<div className="mt-6">\s*<h2 className="text-lg font-black text-slate-900 mb-4">Daftar Produk<\/h2>.*?(?=\{\/\*\s*Custom Delete Modal\s*\*\/\})/s;
     code = code.replace(daftarProdukAlternative, "");
  }
  
  // 4. Remove the Delete Modal entirely because this is just a form now
  const deleteModalRegex = /\{\/\*\s*Custom Delete Modal\s*\*\/\}.*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>)/s;
  // Let's just remove anything from Custom Delete Modal to the end of the return statement
  const deleteModalAlt = /\{\/\*\s*Custom Delete Modal\s*\*\/\}.*?(?=<\/>)/s;
  code = code.replace(deleteModalAlt, "");
  
  // Remove unused state
  code = code.replace(/const \[products, setProducts\].*?;/, "");
  code = code.replace(/const \[searchQuery, setSearchQuery\].*?;/, "");
  
  fs.writeFileSync(file, code);
  console.log(`Patched ${file}`);
}

['percetakan', 'ritel', 'jasa'].forEach(cat => patchNewPage(cat));
