import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL || "file:./dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const fastDb = createClient({
  url,
  authToken
});

// Inisialisasi tabel tanpa Prisma (Fast Lane)
let initialized = false;
export async function initFastLane() {
  if (initialized) return;
  try {
    await fastDb.execute(`
      CREATE TABLE IF NOT EXISTS _FastOnlineUsers (
        email TEXT PRIMARY KEY,
        name TEXT,
        role TEXT,
        lastActive DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    initialized = true;
  } catch (e) {
    console.error("FastLane Init Error:", e);
  }
}
