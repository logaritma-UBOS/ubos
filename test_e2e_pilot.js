const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculateCustomerSegment } = require('./src/lib/marketing');

async function runE2E() {
  console.log("Starting E2E Validation...");

  // 1. Setup Test Data
  const business = await prisma.business.findFirst();
  if (!business) throw new Error("No business found");

  const customer = await prisma.customer.create({
    data: { businessId: business.id, name: "E2E Test User", phone: "081234567890", category: "BELUM_ADA_TRANSAKSI" }
  });

  const content = await prisma.contentPlan.create({
    data: { businessId: business.id, title: "Promo Merdeka", platform: "TIKTOK", status: "SUDAH_POSTING" }
  });

  const promo = await prisma.promo.create({
    data: { businessId: business.id, name: "Merdeka Sale", code: "MERDEKA100", discountType: "FIXED", discountValue: 10000, isActive: true }
  });

  const campaign = await prisma.campaign.create({
    data: { businessId: business.id, name: "Blast Merdeka", targetSegment: "BELUM_ADA_TRANSAKSI", contentPlanId: content.id, promoId: promo.id, status: "TERKIRIM" }
  });

  const product = await prisma.product.findFirst({ where: { businessId: business.id } });
  if (!product) throw new Error("No product found");

  // 2. Simulate Kasir Transaction (checkoutSale action logic)
  const finalTotal = 50000;
  let campaignId = null;

  // POS logic mock:
  const activeCampaign = await prisma.campaign.findFirst({
    where: { promoId: promo.id, businessId: business.id, status: { in: ['SIAP_DIKIRIM', 'TERKIRIM'] } },
    orderBy: { createdAt: 'desc' }
  });
  if (activeCampaign) campaignId = activeCampaign.id;

  await prisma.$transaction(async (tx) => {
    // a. Create Sale
    const sale = await tx.sale.create({
      data: {
        businessId: business.id,
        clientTransactionId: "E2E-" + Date.now(),
        totalAmount: finalTotal,
        paymentMethod: "CASH",
        customerId: customer.id,
        promoId: promo.id,
        campaignId: campaignId
      }
    });

    // b. Update Promo Usage
    await tx.promo.update({
      where: { id: promo.id },
      data: { usageCount: { increment: 1 } }
    });

    // c. Update Customer
    const cust = await tx.customer.findUnique({
      where: { id: customer.id },
      include: { sales: true }
    });
    const allSalesForSegment = [...cust.sales, { totalAmount: finalTotal, createdAt: new Date() }];
    const segmentInfo = calculateCustomerSegment(allSalesForSegment);
    
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        totalPurchases: { increment: 1 },
        lastPurchaseDate: new Date(),
        category: segmentInfo.marketingSegment
      }
    });
  });

  // 3. Assertions
  const finalSale = await prisma.sale.findFirst({ where: { customerId: customer.id } });
  const finalPromo = await prisma.promo.findUnique({ where: { id: promo.id } });
  const finalCustomer = await prisma.customer.findUnique({ where: { id: customer.id } });

  console.log("--- Validation Results ---");
  console.log(`1. campaignId tercatat: ${finalSale.campaignId === campaign.id ? 'PASS' : 'FAIL'} (${finalSale.campaignId})`);
  console.log(`2. promo usageCount bertambah: ${finalPromo.usageCount === 1 ? 'PASS' : 'FAIL'} (${finalPromo.usageCount})`);
  console.log(`3. totalPurchases bertambah: ${finalCustomer.totalPurchases === 1 ? 'PASS' : 'FAIL'} (${finalCustomer.totalPurchases})`);
  console.log(`4. lastPurchaseDate berubah: ${finalCustomer.lastPurchaseDate !== null ? 'PASS' : 'FAIL'}`);
  console.log(`5. category diperbarui: ${finalCustomer.category === 'BARU' ? 'PASS' : 'FAIL'} (${finalCustomer.category})`);

  // Cleanup
  await prisma.sale.deleteMany({ where: { customerId: customer.id } });
  await prisma.campaign.delete({ where: { id: campaign.id } });
  await prisma.promo.delete({ where: { id: promo.id } });
  await prisma.contentPlan.delete({ where: { id: content.id } });
  await prisma.customer.delete({ where: { id: customer.id } });
}

runE2E().catch(console.error);