# Darkie Zone – OSINT & Intelligence Lookup Portal

A fast, responsive web application for OSINT intelligence, lookup services (Mobile Number, Aadhaar UID, Email), and cybersecurity utility tools.

## 🌐 Working Live URLs
- **Main Production Web Portal (Vercel)**: [https://darkie-zone.vercel.app](https://darkie-zone.vercel.app)
- **GitHub Pages Portal**: [https://digital-marketing989.github.io/info-gathering-data/](https://digital-marketing989.github.io/info-gathering-data/)
- **GitHub Repository**: [https://github.com/digital-marketing989/info-gathering-data](https://github.com/digital-marketing989/info-gathering-data)

## Features
- **Number Lookup**: Telecom operator, circle, and subscriber information.
- **Aadhaar Lookup**: UID verification and associated demographic records.
- **Email Lookup**: Email provider, status, and breach data.
- **Cybersecurity & OSINT Showcase**: Upcoming tools roadmap with 24 modules.
- **Clean Matrix UI**: Hacker terminal aesthetic with responsive sidebar and mobile dock navigation.

## Architecture
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Served directly via Vercel Edge CDN or GitHub Pages).
- **Backend**: Express.js serverless functions located in `/api` (CORS-enabled for GitHub Pages).
- **Local Dev Server**: Node.js Express server (`server.js`).

## Running Locally
```bash
npm install
npm start
```
Open `http://localhost:3000` in your browser.

## Deployment on Vercel
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy update"
   git push origin main
   ```
2. Deploy via Vercel CLI or Vercel Dashboard:
   ```bash
   vercel --prod
   ```
3. Set Environment Variables in Vercel Project Settings if customized:
   - `API_KEY`
   - `AADHAR_API`
   - `NUMBER_API`
   - `EMAIL_API`