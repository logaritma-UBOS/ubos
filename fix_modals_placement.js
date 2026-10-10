const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove all existing `{renderModals()}`
code = code.split('\n').filter(line => !line.includes('{renderModals()}')).join('\n');

// 2. Inject into PAYMENT block
// Look for `if (step === "PAYMENT") {`
const paymentStart = code.indexOf('if (step === "PAYMENT") {');
const cartStart = code.indexOf('// CART VIEW (default)');

if (paymentStart !== -1 && cartStart !== -1) {
  let paymentBlock = code.substring(paymentStart, cartStart);
  
  // Find the last `</div>` before the final `)` of the payment return statement
  const lastParen = paymentBlock.lastIndexOf(')');
  if (lastParen !== -1) {
    const textBeforeParen = paymentBlock.substring(0, lastParen);
    const lastDiv = textBeforeParen.lastIndexOf('</div>');
    if (lastDiv !== -1) {
      paymentBlock = textBeforeParen.substring(0, lastDiv) + '\n      {renderModals()}\n      ' + textBeforeParen.substring(lastDiv) + paymentBlock.substring(lastParen);
      code = code.substring(0, paymentStart) + paymentBlock + code.substring(cartStart);
    }
  }
}

// 3. Inject into CART block (main return)
// The end of the file is `</div>\n  )\n}`
const endOfFileMatch = code.lastIndexOf('</div>\n  )\n}');
if (endOfFileMatch !== -1) {
  code = code.substring(0, endOfFileMatch) + '\n      {renderModals()}\n    ' + code.substring(endOfFileMatch);
} else {
  // Try to find just the last `</div>` before `)`
  const lastFileParen = code.lastIndexOf(')');
  const lastFileDiv = code.lastIndexOf('</div>', lastFileParen);
  if (lastFileDiv !== -1) {
    code = code.substring(0, lastFileDiv) + '\n      {renderModals()}\n    ' + code.substring(lastFileDiv);
  }
}

fs.writeFileSync(file, code);
console.log('Fixed renderModals placement safely!');
