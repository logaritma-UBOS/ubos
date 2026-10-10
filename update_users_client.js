const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add currentUser to props
content = content.replace('export default function UsersClient({ users }: { users: any[] }) {', 'export default function UsersClient({ users, currentUser }: { users: any[], currentUser?: any }) {');

// Add canFollowUp function
const canFollowUpCode = `
    const canFollowUp = (u) => {
        if (!currentUser) return true;
        const name = (currentUser.name || '').toLowerCase();
        if (name.includes('bana')) return u.tier === 'STARTER';
        if (name.includes('baim')) return u.tier === 'PRO_BULANAN' || u.tier === 'PRO_TAHUNAN' || u.tier === 'LIFETIME';
        if (name.includes('tony') || name.includes('reza')) return false;
        return true;
    };
`;
content = content.replace('// Auto-compute CRM Status', canFollowUpCode + '\n    // Auto-compute CRM Status');

// Conditionally render the button
content = content.replace(
  '<button \n                                                onClick={() => handleFollowUpWA(u)}',
  '{canFollowUp(u) && <button \n                                                onClick={() => handleFollowUpWA(u)}'
);
content = content.replace(
  '{loadingWa === u.id ? "Proses..." : "Follow Up (WA Pribadi)"}\n                                              </button>',
  '{loadingWa === u.id ? "Proses..." : "Follow Up (WA Pribadi)"}\n                                              </button>}'
);

fs.writeFileSync(file, content);
console.log('UsersClient updated with Role-Based access!');
