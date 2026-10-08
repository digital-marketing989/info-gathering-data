require('dotenv').config();
const express = require('express');
const path = require('path');
const app = require('./api/index');

const PORT = process.env.PORT || 3000;

// Serve static frontend files for local development
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for non-API routes in local dev
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(__dirname, 'index.html'));
    }
    next();
});

// Start local server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Darkie Zone running locally at http://localhost:${PORT}`);
    });
}

module.exports = app;