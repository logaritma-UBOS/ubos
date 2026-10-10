const fs = require('fs');
const file = 'src/actions/customer.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/revalidatePath\("\/pelanggan"\)`n    revalidatePath\("\/marketing"\)`n    return \{ success: true, customer \}/g, 'revalidatePath("/pelanggan");\n    revalidatePath("/marketing");\n    return { success: true, customer }');

fs.writeFileSync(file, content);
