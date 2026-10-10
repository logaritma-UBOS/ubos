const fs = require('fs');
const file = 'src/app/(dashboard)/kasir/KasirClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Extract the Modals block
const modalStart = '{/* Draft Input Modal */}';
const modalEnd = '      {/* Draft List Modal */}';
// Wait, the end of the Draft List Modal is `</div>\n      )}`
const endOfModals = '</div>\n      )}';

const modalStartIndex = code.indexOf(modalStart);
if (modalStartIndex === -1) throw new Error("Modal start not found");

// Find the second `</div>\n      )}` after the modalStart
let afterModalStart = code.substring(modalStartIndex);
let draftListModalStart = afterModalStart.indexOf(modalEnd);
let afterDraftListModal = afterModalStart.substring(draftListModalStart);
let modalEndIndex = modalStartIndex + draftListModalStart + afterDraftListModal.indexOf(endOfModals) + endOfModals.length;

const modalsCode = code.substring(modalStartIndex, modalEndIndex);

// Remove the modals from the bottom of the file
code = code.substring(0, modalStartIndex) + code.substring(modalEndIndex);

// 2. Create the renderModals function inside the component
// Find a good place, e.g., right before `if (step === "SUCCESS" && transactionSummary) {`
const renderModalsAnchor = 'if (step === "SUCCESS" && transactionSummary) {';
const renderModalsFunc = `
  const renderModals = () => (
    <>
      ${modalsCode.split('\\n').join('\\n      ')}
    </>
  );

  `;
code = code.replace(renderModalsAnchor, renderModalsFunc + renderModalsAnchor);

// 3. Inject {renderModals()} into PAYMENT block
// Look for the end of the PAYMENT block return statement
// It ends with `</div>\n      </div>\n    )\n  }` -> wait, let's find `if (step === "PAYMENT") {`
const paymentBlockStart = code.indexOf('if (step === "PAYMENT") {');
const cartBlockStart = code.indexOf('// CART VIEW (default)');
if (paymentBlockStart !== -1 && cartBlockStart !== -1) {
    let paymentBlock = code.substring(paymentBlockStart, cartBlockStart);
    // Find the last `</div>` before the `)` of the return statement
    const lastReturnParen = paymentBlock.lastIndexOf(')');
    if (lastReturnParen !== -1) {
        paymentBlock = paymentBlock.substring(0, lastReturnParen) + '\n        {renderModals()}\n      ' + paymentBlock.substring(lastReturnParen);
        code = code.substring(0, paymentBlockStart) + paymentBlock + code.substring(cartBlockStart);
    }
}

// 4. Inject {renderModals()} into CART block (at the bottom where we removed it from)
const cartBlockEnd = code.lastIndexOf('</>');
if (cartBlockEnd !== -1) {
    code = code.substring(0, cartBlockEnd) + '\n      {renderModals()}\n      ' + code.substring(cartBlockEnd);
} else {
    // maybe it ends with </div> instead of </>
    const lastDiv = code.lastIndexOf('</div>');
    code = code.substring(0, lastDiv) + '\n      {renderModals()}\n    ' + code.substring(lastDiv);
}

fs.writeFileSync(file, code);
console.log('Modals extracted and injected into both views!');
