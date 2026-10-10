require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const sessions = new Map();

// Setup logger
const logger = pino({ level: 'silent' });

async function initSession(sessionId) {
    if (sessions.has(sessionId)) {
        const existing = sessions.get(sessionId);
        if (existing.status === 'connected' || existing.status === 'initializing' || existing.status === 'waiting_for_scan') {
            return existing;
        }
    }
    
    console.log('Initializing session:', sessionId);
    const sessionPath = path.join(__dirname, 'sessions', 'auth_' + sessionId);
    
    // Ensure directory exists
    if (!fs.existsSync(path.join(__dirname, 'sessions'))) {
        fs.mkdirSync(path.join(__dirname, 'sessions'));
    }
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    let version;
    try {
        const res = await fetchLatestBaileysVersion();
        version = res.version;
    } catch(err) {
        version = [2, 3000, 1015901307];
    }

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        generateHighQualityLinkPreview: false,
        syncFullHistory: false, markOnlineOnConnect: false
    });

    const sessionObj = { sock, qr: null, status: 'initializing', retries: 0 };
    sessions.set(sessionId, sessionObj);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => { 
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('QR generated for', sessionId);
            sessionObj.qr = qr;
            sessionObj.status = 'waiting_for_scan';
        }

        if (connection === 'close') {
            sessionObj.qr = null;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            const isBadSession = statusCode === 500 || String(lastDisconnect?.error).includes('Bad MAC') || String(lastDisconnect?.error).includes('decrypt');

            console.log('Connection closed for', sessionId, 'Code:', statusCode, 'isLoggedOut:', isLoggedOut);

            if (isLoggedOut || isBadSession) {
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
            }
        } else if (connection === 'open') {
            console.log('Session connected!', sessionId);
            sessionObj.qr = null;
            sessionObj.status = 'connected';
            sessionObj.retries = 0;
        }
    });
    
    return sessionObj;
}

// Restore sessions on startup
if (fs.existsSync(path.join(__dirname, 'sessions'))) {
    const dirs = fs.readdirSync(path.join(__dirname, 'sessions'));
    for (const dir of dirs) {
        if (dir.startsWith('auth_')) {
            const sessionId = dir.replace('auth_', '');
            initSession(sessionId).catch(console.error);
        }
    }
}

app.get('/status', async (req, res) => {
    const sessionId = req.query.session || 'master';
    let session = sessions.get(sessionId);
    
    if (!session) {
        try {
            session = await initSession(sessionId);
        } catch (error) {
            console.error('initSession error:', error);
            return res.json({ status: 'error' });
        }
    }

    if (session.status === 'connected' || session.sock?.user) {
        res.json({ status: 'connected', user: session.sock.user });
    } else if (session.qr) {
        res.json({ status: 'waiting_for_scan', qr: session.qr });
    } else {
        res.json({ status: 'initializing' });
    }
});

app.post('/disconnect', async (req, res) => {
    const sessionId = req.query.session || 'master';
    const session = sessions.get(sessionId);
    if (session) {
        session.status = 'disconnected';
        try { await session.sock.logout(); } catch(e) {}
        const sessionPath = path.join(__dirname, 'sessions', 'auth_' + sessionId);
        if (fs.existsSync(sessionPath)) fs.rmSync(sessionPath, { recursive: true, force: true });
        sessions.delete(sessionId);
    }
    res.json({ success: true });
});

app.post('/send-message', async (req, res) => {
    const { phone, text } = req.body;
    const sessionId = req.query.session || 'master';
    const session = sessions.get(sessionId);
    
    if (!session || session.status !== 'connected' || !session.sock?.user) {
        return res.status(401).json({ error: 'WhatsApp is not connected' });
    }

    try {
        const jid = phone.includes('@') ? phone : phone + '@s.whatsapp.net';
        await session.sock.sendMessage(jid, { text });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log('Ready on ' + PORT));
