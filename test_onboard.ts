import { prisma } from './src/lib/prisma';

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) return console.log('No user');
  
  const tx = prisma; // fake tx
  const name = 'Test Retail';
  const businessType = 'RETAIL';
  const operatingDays = 7;
  const targetOmzet = 10000000;
  
  const productName = 'Produk Pertama';
  const sellPrice = 50000;
  
  try {
      const business = await tx.business.create({
        data: {
          userId: user.id,
          name,
          businessType,
          operatingDays,
          settings: {
            create: { baseCurrency: 'IDR' }
          },
          goals: {
            create: {
              targetOmzet,
              period: 'MONTHLY'
            }
          }
        }
      });
      
      console.log('Business created:', business.id);
      
      if (productName && sellPrice) {
        await tx.product.create({
          data: {
            businessId: business.id,
            name: productName,
            sellPrice
          }
        });
        console.log('Product created');
      }
  } catch (e) {
      console.error('ERROR CREATING:', e);
  }
}
run().then(() => process.exit(0));
