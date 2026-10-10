const fs = require('fs');
let code = fs.readFileSync('vps_index.js', 'utf8');

// 1. Modify the connection close logic to NOT delete session immediately on 500/Bad MAC
const oldCloseLogic = `            if (isLoggedOut || isBadSession) {
                // If logged out from phone or corrupt session, delete creds and mark disconnected
                console.log('Session', sessionId, 'is invalid/logged out. Deleting credentials.');
                sessionObj.status = 'disconnected';
                if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
                sessions.delete(sessionId);
            } else {
                // Auto reconnect
                sessionObj.status = 'reconnecting';
                const delay = statusCode === 428 ? 5000 : 2000;
                console.log('Reconnecting session', sessionId, 'in', delay, 'ms');
                setTimeout(() => {
                    initSession(sessionId).catch(console.error);
                }, delay);
            }`;

const newCloseLogic = `            if (isLoggedOut) {
                console.log('Session', sessionId, 'is explicitly logged out (401). Deleting credentials.');
                sessionObj.status = 'disconnected';
                if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
                sessions.delete(sessionId);
            } else {
                if (isBadSession) {
                    sessionObj.retries = (sessionObj.retries || 0) + 1;
                    if (sessionObj.retries > 5) {
                        console.log('Session', sessionId, 'exceeded 5 Bad MAC/500 retries. Deleting credentials as last resort.');
                        sessionObj.status = 'disconnected';
                        if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
                        sessions.delete(sessionId);
                        return;
                    }
                    console.log('Session', sessionId, 'Bad MAC/500 detected. Retry', sessionObj.retries, '/ 5. Attempting to heal...');
                }
                
                // Auto reconnect
                sessionObj.status = 'reconnecting';
                const delay = statusCode === 428 ? 5000 : 2000;
                console.log('Reconnecting session', sessionId, 'in', delay, 'ms');
                setTimeout(() => {
                    initSession(sessionId).catch(console.error);
                }, delay);
            }`;

code = code.replace(oldCloseLogic, newCloseLogic);

// 2. Add Keep-Alive Ping Mechanism at the bottom, before app.listen
const keepAliveCode = `
// --- Auto-Reconnect / Keep-Alive Ping Mechanism ---
// Menipu server Meta agar koneksi dianggap terus aktif
setInterval(() => {
    sessions.forEach(async (session, sessionId) => {
        if (session.status === 'connected' && session.sock) {
            try {
                // Kirim ping presence 'available' untuk menjaga socket tetap hidup
                await session.sock.sendPresenceUpdate('available');
                console.log('Ping Keep-Alive terkirim untuk sesi:', sessionId);
            } catch (err) {
                console.log('Gagal mengirim Ping Keep-Alive untuk sesi:', sessionId, err.message);
            }
        }
    });
}, 10 * 60 * 1000); // Eksekusi setiap 10 menit
`;

code = code.replace("app.listen(PORT, () => console.log('Ready on ' + PORT));", keepAliveCode + "\napp.listen(PORT, () => console.log('Ready on ' + PORT));");

fs.writeFileSync('vps_index_fixed.js', code);
console.log('Modified VPS script');
