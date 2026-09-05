import { editProduct } from './src/actions/catalog';
import { prisma } from './src/lib/prisma';

async function run() {
  const p = await prisma.product.findFirst({ where: { name: 'Test Product' } });
  const s = await prisma.supplier.findFirst({ where: { name: 'Test Supplier' } });
  if(!p || !s) return;
  
  const formData = new FormData();
  formData.append('id', p.id);
  formData.append('name', p.name);
  formData.append('sellPrice', '2000');
  formData.append('purchaseCost', '1000');
  formData.append('supplierId', s.id);
  
  try {
    await editProduct(null, formData);
  } catch(e) {
    console.log('Redirected or error:', e);
  }
  
  const p2 = await prisma.product.findUnique({ where: { id: p.id } });
  console.log('After edit, supplierId:', p2?.supplierId);
}
run().finally(() => process.exit(0));
