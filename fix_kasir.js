const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /href=\{`https:\/\/wa\.me\/\$\{transactionSummary\.customerPhone \? transactionSummary\.customerPhone\.replace\(\/\\D\/g, ""\)\.replace\(\/\^0\/, "62"\) : ""\}\?text=\$\{encodeURIComponent\(`Halo! Terima kasih telah berbelanja\.\\n\\nTotal Tagihan: \$\{formatRupiah\(transactionSummary\.total\)\}\\nMetode Pembayaran: \$\{transactionSummary\.paymentMethod\}\\n\\nLihat e-struk Anda di sini:\\n\$\{typeof window !== 'undefined' \? window\.location\.origin : ''\}\/kasir\/struk\/\$\{transactionSummary\.clientTransactionId\}`\)\}`\}/g;

const replace = `href={\`https://wa.me/\${transactionSummary.customerPhone ? transactionSummary.customerPhone.replace(/\\D/g, "").replace(/^0/, "62") : ""}?text=\${encodeURIComponent(\`Halo\${transactionSummary.customerName ? \\\` \${transactionSummary.customerName}\\\` : ''}! Terima kasih telah berbelanja.\\n\\nRincian Pesanan:\\n\` + (transactionSummary.items || []).map((item: any) => \\\`- \${item.quantity}x \${item.name} = \${formatRupiah(item.quantity * item.sellPrice)}\\\`).join('\\n') + \\\`\\n\\nTotal Tagihan: \${formatRupiah(transactionSummary.total)}\\\` + (transactionSummary.discount > 0 ? \\\`\\nDiskon Promo: -\${formatRupiah(transactionSummary.discount)}\\\` : '') + \\\`\\nMetode Pembayaran: \${transactionSummary.paymentMethod}\\n\\nLihat e-struk Anda di sini:\\n\${typeof window !== 'undefined' ? window.location.origin : ''}/kasir/struk/\${transactionSummary.clientTransactionId}\\\`)}\`}`;

if (code.match(regex)) {
  code = code.replace(regex, replace);
  fs.writeFileSync(file, code);
  console.log('REPLACED SUCCESSFULLY');
} else {
  console.log('REGEX NOT MATCHED');
}
