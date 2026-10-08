require('dotenv').config();
const express = require('express');

const app = express();

const API_KEY = process.env.API_KEY || 'danish-nfs';
const AADHAR_API = process.env.AADHAR_API || 'https://ftosint.world/api/aadhar';
const NUMBER_API = process.env.NUMBER_API || 'https://ftosint.world/api/number';
const EMAIL_API = process.env.EMAIL_API || 'https://ftosint.world/api/email';

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Helper: recursively remove 'by' or '@ftgamer2' mentions
function sanitizeData(obj) {
    if (!obj || typeof obj !== 'object') {
        if (typeof obj === 'string') {
            return obj.replace(/@?ftgamer2/gi, '').trim();
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeData(item));
    }
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
        if (key.toLowerCase() === 'by' || (typeof val === 'string' && val.toLowerCase().includes('ftgamer2'))) {
            continue;
        }
        clean[key] = sanitizeData(val);
    }
    return clean;
}

// Helper: fetch with native fetch / node-fetch fallback
async function apiFetch(url) {
    let fetchFn = globalThis.fetch;
    if (!fetchFn) {
        try {
            fetchFn = (await import('node-fetch')).default;
        } catch {
            fetchFn = require('node-fetch');
        }
    }
    const res = await fetchFn(url, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const text = await res.text();
    console.log(`[API] ${url.split('?')[0]} → ${text.substring(0, 120)}`);
    try {
        const parsed = JSON.parse(text);
        return sanitizeData(parsed);
    } catch {
        const cleanText = text.replace(/@?ftgamer2/gi, '');
        return { success: false, message: 'Invalid API response', raw: cleanText };
    }
}

// API Router
const router = express.Router();

// ── Health / Status ─────────────────────────────────────────────
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/status', (req, res) => {
    res.json({ success: true, message: 'Darkie Zone API is operational' });
});

// ── Aadhaar Lookup ──────────────────────────────────────────────
router.post('/aadhar', async (req, res) => {
    const { num } = req.body || {};
    if (!num || !/^\d{12}$/.test(num))
        return res.status(400).json({ success: false, message: 'Enter a valid 12-digit Aadhaar number.' });
    try {
        const data = await apiFetch(`${AADHAR_API}?key=${API_KEY}&num=${num}`);
        res.json(data);
    } catch (e) {
        console.error('Aadhaar API Error:', e.message);
        res.status(500).json({ success: false, message: 'Aadhaar API unreachable.' });
    }
});

// ── Number Lookup ───────────────────────────────────────────────
router.post('/number', async (req, res) => {
    const { num } = req.body || {};
    if (!num || !/^\d{10}$/.test(num))
        return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    try {
        const data = await apiFetch(`${NUMBER_API}?key=${API_KEY}&num=${num}`);
        res.json(data);
    } catch (e) {
        console.error('Number API Error:', e.message);
        res.status(500).json({ success: false, message: 'Number API unreachable.' });
    }
});

// ── Email Lookup ────────────────────────────────────────────────
router.post('/email', async (req, res) => {
    const { email } = req.body || {};
    if (!email || !email.includes('@'))
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    try {
        const data = await apiFetch(`${EMAIL_API}?key=${API_KEY}&email=${encodeURIComponent(email)}`);
        res.json(data);
    } catch (e) {
        console.error('Email API Error:', e.message);
        res.status(500).json({ success: false, message: 'Email API unreachable.' });
    }
});

// ── Legacy Lookup Route ─────────────────────────────────────────
router.post('/lookup', async (req, res) => {
    const { queryNumber } = req.body || {};
    if (!queryNumber || !/^\d{12}$/.test(queryNumber))
        return res.status(400).json({ success: false, message: 'Enter a valid 12-digit Aadhaar number.' });
    try {
        const data = await apiFetch(`${AADHAR_API}?key=${API_KEY}&num=${queryNumber}`);
        res.json(data);
    } catch (e) {
        console.error('Lookup API Error:', e.message);
        res.status(500).json({ success: false, message: 'API unreachable.' });
    }
});

// Base API route status
app.get('/api', (req, res) => {
    res.json({ success: true, message: 'Darkie Zone API is operational' });
});

// Mount router under both /api and without /api (to handle any rewrite format)
app.use('/api', router);
app.use(router);

module.exports = app;
