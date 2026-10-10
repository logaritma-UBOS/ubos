const fs = require('fs');
const file = 'src/app/api/cron/wa-alerts/route.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace weird symbols
content = content.replace(/\?\? \*Laporan Progres Ceklis Harian\*/g, "?? *Laporan Progres Ceklis Harian*");
content = content.replace(/Halo " \+ member.name \+ "! \?\?/g, "Halo \" + member.name + \"! ??");
content = content.replace(/Sore " \+ member.name \+ "! \?/g, "Sore \" + member.name + \"! ?");
content = content.replace(/Tetap semangat dan persiapkan diri untuk besok! \?\?/g, "Tetap semangat dan persiapkan diri untuk besok! ??");
content = content.replace(/reportMsg \+= "\?\? \*" \+ member.name \+ "\*: " \+ completed \+ "\/" \+ total \+ " Selesai \(" \+ percentage \+ "%\)\\n";/g, 'reportMsg += "? *" + member.name + "*: " + completed + "/" + total + " Selesai (" + percentage + "%)\\n";');

fs.writeFileSync(file, content);
console.log('Emojis fixed');
