const fs = require('fs');
const file = 'src/actions/pos.ts';
let code = fs.readFileSync(file, 'utf8');

// Update saveDraftSale
code = code.replace(
  'export async function saveDraftSale(cart: CartItem[], clientTransactionId: string, draftName: string) {',
  'export async function saveDraftSale(cart: CartItem[], clientTransactionId: string, draftName: string, draftPhone: string | null = null) {'
);
code = code.replace(
  'return updateDraftSale(cart, clientTransactionId, draftName);',
  'return updateDraftSale(cart, clientTransactionId, draftName, draftPhone);'
);
code = code.replace(
  'draftName: draftName,',
  'draftName: draftName,\n          draftPhone: draftPhone,'
);

// Update updateDraftSale
code = code.replace(
  'export async function updateDraftSale(cart: CartItem[], clientTransactionId: string, draftName: string) {',
  'export async function updateDraftSale(cart: CartItem[], clientTransactionId: string, draftName: string, draftPhone: string | null = null) {'
);
code = code.replace(
  'draftName: draftName,',
  'draftName: draftName,\n                    draftPhone: draftPhone,'
);

fs.writeFileSync(file, code);
console.log('pos.ts updated for draftPhone');
