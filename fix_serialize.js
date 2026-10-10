const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('export default function UsersClient({ users, currentUser }: { users: any[], currentUser?: any }) {', 'export default function UsersClient({ users, currentUserEmail }: { users: any[], currentUserEmail?: string }) {');

const oldCanFollowUp = `    const canFollowUp = (u) => {
        if (!currentUser) return true;
        const email = (currentUser.email || '').toLowerCase();
        if (email.includes('bana')) return u.tier === 'STARTER';
        if (email.includes('baim') || email === 'logaritma.tim@gmail.com') return u.tier === 'PRO_BULANAN' || u.tier === 'PRO_TAHUNAN' || u.tier === 'LIFETIME';
        if (email.includes('tony') || email.includes('reza')) return false;
        return true; // Admin or others
    };`;

const newCanFollowUp = `    const canFollowUp = (u) => {
        if (!currentUserEmail) return true;
        const email = currentUserEmail.toLowerCase();
        if (email.includes('bana')) return u.tier === 'STARTER';
        if (email.includes('baim') || email === 'logaritma.tim@gmail.com') return u.tier === 'PRO_BULANAN' || u.tier === 'PRO_TAHUNAN' || u.tier === 'LIFETIME';
        if (email.includes('tony') || email.includes('reza')) return false;
        return true; // Admin or others
    };`;

content = content.replace(oldCanFollowUp, newCanFollowUp);
fs.writeFileSync(file, content);
console.log('Fixed UsersClient serialization bug!');
