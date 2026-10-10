const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const res = await saveDraftSale(\n      cart.map(c => ({ ...c, quantity: c.quantity })),\n      clientTransactionId,\n      draftName,\n      draftPhoneInput || null\n    );',
  'const res = await saveDraftSale(\n      cart.map(c => ({ productId: c.id, quantity: c.quantity })),\n      clientTransactionId,\n      draftNameInput,\n      draftPhoneInput || null\n    );'
);

// Wait, I see I also used `draftName` instead of `draftNameInput` in `saveDraftSale` in my previous script! 
// Let me just replace the whole block more safely using regex.
const fixPattern = /const res = await saveDraftSale\([\s\S]*?draftPhoneInput \|\| null\s*\);/;
const replacement = `const res = await saveDraftSale(
      cart.map(c => ({ productId: c.id, quantity: c.quantity })),
      clientTransactionId,
      draftNameInput,
      draftPhoneInput || null
    );`;

if (fixPattern.test(code)) {
    code = code.replace(fixPattern, replacement);
    fs.writeFileSync(file, code);
    console.log('Fixed payload sent to saveDraftSale');
} else {
    console.log('Pattern not found');
}
