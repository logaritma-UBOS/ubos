const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add campaign to Sale
if (!content.includes('campaignId     String?')) {
    content = content.replace('saleItems           SaleItem[]', 'saleItems           SaleItem[]\n  campaignId          String?\n  campaign            Campaign?  @relation(fields: [campaignId], references: [id])');
}

// Add campaigns to ContentPlan
if (!content.includes('campaigns       Campaign[]')) {
    content = content.replace('updatedAt       DateTime  @updatedAt\n}', 'updatedAt       DateTime  @updatedAt\n  campaigns       Campaign[]\n}');
}

fs.writeFileSync('prisma/schema.prisma', content, 'utf8');