const fs = require('fs');
const file = 'src/app/admin/pilot/(dashboard)/users/UsersClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix canFollowUp logic to use email instead of name, which is more reliable
const oldCanFollowUp = `    const canFollowUp = (u) => {
        if (!currentUser) return true;
        const name = (currentUser.name || '').toLowerCase();
        if (name.includes('bana')) return u.tier === 'STARTER';
        if (name.includes('baim')) return u.tier === 'PRO_BULANAN' || u.tier === 'PRO_TAHUNAN' || u.tier === 'LIFETIME';
        if (name.includes('tony') || name.includes('reza')) return false;
        return true;
    };`;

const newCanFollowUp = `    const canFollowUp = (u) => {
        if (!currentUser) return true;
        const email = (currentUser.email || '').toLowerCase();
        if (email.includes('bana')) return u.tier === 'STARTER';
        if (email.includes('baim')) return u.tier === 'PRO_BULANAN' || u.tier === 'PRO_TAHUNAN' || u.tier === 'LIFETIME';
        if (email.includes('tony') || email.includes('reza')) return false;
        return true; // Admin or others
    };`;

content = content.replace(oldCanFollowUp, newCanFollowUp);

// Add the Follow Up Indicator column
const oldThead = `<th className="px-4 py-3">Login Terakhir</th>
                            <th className="px-4 py-3">Kontak & Aksi</th>`;
const newThead = `<th className="px-4 py-3">Login Terakhir</th>
                            <th className="px-4 py-3 text-center">Tanda FU</th>
                            <th className="px-4 py-3">Kontak & Aksi</th>`;
content = content.replace(oldThead, newThead);

const oldTd = `<td className="px-4 py-3 text-xs text-gray-600">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                                    </td>
                                    <td className="px-4 py-3">`;
const newTd = `<td className="px-4 py-3 text-xs text-gray-600">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={\`px-2 py-1 rounded-full text-[10px] font-black \${u.followUpCount >= 3 ? "bg-emerald-100 text-emerald-700" : u.followUpCount === 2 ? "bg-blue-100 text-blue-700" : u.followUpCount === 1 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}\`}>
                                        FU {u.followUpCount || 0} / 3
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">`;
content = content.replace(oldTd, newTd);

fs.writeFileSync(file, content);
console.log('Fixed UsersClient!');
