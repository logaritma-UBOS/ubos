import { createClient } from "@libsql/client";

// Ensure URL is strictly valid or fallback to local SQLite during Vercel build
const envUrl = process.env.DATABASE_URL;
const url = (envUrl && envUrl.startsWith("libsql")) ? envUrl : "file:./dev.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const fastDb = createClient({
  url,
  authToken
});

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
