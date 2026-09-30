const fs = require('fs');
let code = fs.readFileSync('run_turso_mig.js', 'utf8');

const injection = `
    try {
        await client.execute('ALTER TABLE "User" ADD COLUMN "staffBusinessId" TEXT');
        console.log("Added staffBusinessId to User");
    } catch (e) {
        if (e.message && !e.message.includes("duplicate column") && !e.message.includes("unrecognized token")) console.error("User alter err:", e.message);
    }

console.log('Done migrations. Seeding Team OS...');
`;

code = code.replace("console.log('Done migrations. Seeding Team OS...');", injection);
fs.writeFileSync('run_turso_mig.js', code);
