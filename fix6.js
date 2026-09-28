const fs = require('fs');

function fix(file) {
    let client = fs.readFileSync(file, 'utf8');
    client = client.replace('transition-all">', 'transition-all`}>');
    fs.writeFileSync(file, client);
}

fix('src/app/(dashboard)/katalog/produk/[id]/edit/EditProductClient.tsx');
fix('src/app/(dashboard)/katalog/produk/tambah/TambahProdukClient.tsx');

console.log('Fixed syntax error');
