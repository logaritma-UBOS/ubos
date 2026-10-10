const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Double check there's no {renderModals()} already inside the PAYMENT block.
const paymentStart = code.indexOf('if (step === "PAYMENT") {');
const cartStart = code.indexOf('// --- CART VIEW (Default) ---');
if (paymentStart !== -1 && cartStart !== -1) {
    let paymentBlock = code.substring(paymentStart, cartStart);
    if (!paymentBlock.includes('{renderModals()}')) {
        // Find the last `</div>` before the final `)` in the paymentBlock
        const lastParen = paymentBlock.lastIndexOf(')');
        if (lastParen !== -1) {
            const textBeforeParen = paymentBlock.substring(0, lastParen);
            const lastDiv = textBeforeParen.lastIndexOf('</div>');
            if (lastDiv !== -1) {
                paymentBlock = textBeforeParen.substring(0, lastDiv) + '\n        {renderModals()}\n      ' + textBeforeParen.substring(lastDiv) + paymentBlock.substring(lastParen);
                code = code.substring(0, paymentStart) + paymentBlock + code.substring(cartStart);
                fs.writeFileSync(file, code);
                console.log('Successfully injected into PAYMENT block!');
            }
        }
    } else {
        console.log('Already injected in PAYMENT block.');
    }
} else {
    console.log('Could not find PAYMENT or CART blocks.');
}
