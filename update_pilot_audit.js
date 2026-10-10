const fs = require('fs');
const file = 'src/lib/pilotAudit.ts';
let content = fs.readFileSync(file, 'utf8');

const oldFonnteCall = `  const target = "120363427940625422@g.us";
  
  await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": "yR1HdhH9wfPVVoKu2G4e",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ target, message })
  });`;

const newVpsCall = `  const target = "120363427940625422@g.us";
  
  let sentViaPrivate = false;
  
  try {
    // Try to send via Private Engine based on who logged in
    const userEmailLower = userEmail.toLowerCase();
    const tm = await prisma.teamMember.findUnique({ where: { email: userEmailLower } });
    
    if (tm) {
       // Baim's special email handling
       const sessionId = "team_" + tm.id;
       const vpsRes = await fetch("http://202.155.94.170:3000/send-message?session=" + sessionId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: target, text: message })
       });
       
       if (vpsRes.ok) {
          sentViaPrivate = true;
       }
    }
  } catch(e) {
    console.error("Private Engine error, falling back to Fonnte", e);
  }
  
  // Fallback to Baim's Fonnte if their private engine is not connected/scanned yet
  if (!sentViaPrivate) {
      await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": "yR1HdhH9wfPVVoKu2G4e",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ target, message })
      });
  }`;

content = content.replace(oldFonnteCall, newVpsCall);

// Modify sendConditionalWA to accept userEmail
content = content.replace('async function sendConditionalWA(userName: string, action: string, detail: string, timestamp: string) {', 'async function sendConditionalWA(userName: string, userEmail: string, action: string, detail: string, timestamp: string) {');
content = content.replace('await sendConditionalWA(userName, action, detail, timestamp);', 'await sendConditionalWA(userName, userEmail, action, detail, timestamp);');
content = content.replace('await sendConditionalWA(userName, action, detail, timestamp);', 'await sendConditionalWA(userName, userEmail, action, detail, timestamp);');

fs.writeFileSync(file, content);
console.log('Fixed pilotAudit.ts to use Private Engine with Fonnte fallback');
