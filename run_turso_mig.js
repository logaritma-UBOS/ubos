const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || dbUrl.includes('[SENSITIVE]')) {
    console.log('Skipping migrations: DATABASE_URL not available');
    process.exit(0);
}

const client = createClient({ url: dbUrl, authToken });

async function migrate() {
    console.log('Running safe additive migrations only...');
    
    // SAFE ADDITIVE MIGRATIONS ONLY - NO DROPS, NO TABLE RECREATIONS
    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "TeamIdea" ("id" TEXT NOT NULL PRIMARY KEY, "authorId" TEXT NOT NULL, "content" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TeamIdea_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE)`);
    } catch(e) {}
    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "SupportMessage" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "senderRole" TEXT NOT NULL, "message" TEXT NOT NULL, "isRead" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SupportMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE)`);
    } catch(e) {}
    try {
        await client.execute(`ALTER TABLE "TeamMember" ADD COLUMN "profilePicture" TEXT`);
    } catch(e) {}
    try {
        await client.execute(`CREATE TABLE IF NOT EXISTS "TeamIdeaComment" ("id" TEXT NOT NULL PRIMARY KEY, "ideaId" TEXT NOT NULL, "authorId" TEXT NOT NULL, "content" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TeamIdeaComment_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "TeamIdea" ("id") ON DELETE CASCADE, CONSTRAINT "TeamIdeaComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE)`);
    } catch(e) {}

    try { await client.execute('ALTER TABLE "TeamMember" ADD COLUMN "bankName" TEXT'); } catch(e) {}
    try { await client.execute('ALTER TABLE "TeamMember" ADD COLUMN "bankAccount" TEXT'); } catch(e) {}
    try { await client.execute('ALTER TABLE "TeamMember" ADD COLUMN "bankAccountName" TEXT'); } catch(e) {}
    try { await client.execute('ALTER TABLE "User" ADD COLUMN "staffBusinessId" TEXT'); } catch(e) {}
    try { await client.execute('ALTER TABLE "Product" ADD COLUMN "currentStock" REAL DEFAULT 0'); } catch(e) {}
    try { await client.execute('ALTER TABLE "Product" ADD COLUMN "minStock" REAL DEFAULT 0'); } catch(e) {}
    try { await client.execute('ALTER TABLE "User" ADD COLUMN "followUpCount" INTEGER NOT NULL DEFAULT 0'); } catch(e) {}
    try { await client.execute('ALTER TABLE "Product" ADD COLUMN "purchaseCost" REAL NOT NULL DEFAULT 0'); } catch(e) {}

    console.log('Safe migrations done.');
}
migrate().catch(console.error);
