const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.production' });

const dbUrl = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url: dbUrl, authToken });

async function check() {
  const rs = await client.execute("SELECT id, totalAmount, createdAt FROM Sale ORDER BY createdAt DESC LIMIT 5");
  console.log("Recent Sales:");
  console.dir(rs.rows);

  const saleIds = rs.rows.map(r => r.id);
  if (saleIds.length > 0) {
    const rsItems = await client.execute(`SELECT * FROM SaleItem WHERE saleId IN (${saleIds.map(id => `'${id}'`).join(',')})`);
    console.log("Sale Items for these sales:");
    console.dir(rsItems.rows);
  }
}

check().catch(console.error);
