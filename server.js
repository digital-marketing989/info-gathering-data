require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// Helper: fetch with node-fetch
async function apiFetch(url) {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
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

// ── Aadhaar Lookup ──────────────────────────────────────────────
app.post('/api/aadhar', async (req, res) => {
    const { num } = req.body;
    if (!num || !/^\d{12}$/.test(num))
        return res.status(400).json({ success: false, message: 'Enter a valid 12-digit Aadhaar number.' });
    try {
        const data = await apiFetch(`${process.env.AADHAR_API}?key=${API_KEY}&num=${num}`);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, message: 'Aadhaar API unreachable.' });
    }
});

// ── Number Lookup ───────────────────────────────────────────────
app.post('/api/number', async (req, res) => {
    const { num } = req.body;
    if (!num || !/^\d{10}$/.test(num))
        return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
    try {
        const data = await apiFetch(`${process.env.NUMBER_API}?key=${API_KEY}&num=${num}`);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, message: 'Number API unreachable.' });
    }
});

// ── Email Lookup ────────────────────────────────────────────────
app.post('/api/email', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@'))
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    try {
        const data = await apiFetch(`${process.env.EMAIL_API}?key=${API_KEY}&email=${encodeURIComponent(email)}`);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, message: 'Email API unreachable.' });
    }
});

// Legacy route kept for backward compat
app.post('/api/lookup', async (req, res) => {
    const { queryNumber } = req.body;
    if (!queryNumber || !/^\d{12}$/.test(queryNumber))
        return res.status(400).json({ success: false, message: 'Enter a valid 12-digit Aadhaar number.' });
    try {
        const data = await apiFetch(`${process.env.AADHAR_API}?key=${API_KEY}&num=${queryNumber}`);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, message: 'API unreachable.' });
    }
});

app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`✅ Darkie Zone running at http://localhost:${PORT}`));