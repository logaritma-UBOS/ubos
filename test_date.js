const d = new Date('2026-08-08T08:16:59.000Z');
d.setDate(d.getDate() + 7);
const now = new Date();
const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
console.log(diff);
