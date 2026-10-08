/* ============================================================
   DARKIE ZONE — script.js
   Handles:
   - Matrix Rain Animation
   - Sidebar Navigation & Mobile Drawer
   - Mobile Bottom Navigation Dock
   - Tool Switching / Filtering (Number | Aadhaar | Email | All)
   - Number Lookup | Aadhaar Lookup | Email Lookup APIs
   ============================================================ */

// ── 1. MATRIX RAIN EFFECT ─────────────────────────────────────
(function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let cols, drops;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.max(1, Math.floor(canvas.width / 16));
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 10, 2, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = '14px Share Tech Mono, monospace';
    drops.forEach((y, i) => {
      const char = String.fromCharCode(0x30A0 + Math.random() * 96);
      ctx.fillText(char, i * 16, y * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  window.addEventListener('resize', resize);
  resize();
  setInterval(draw, 55);
})();

// ── 2. DOM REFERENCES ─────────────────────────────────────────
const sidebar         = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const menuToggle      = document.getElementById('menuToggle');
const sidebarClose    = document.getElementById('sidebarClose');

const resultsSection  = document.getElementById('resultsSection');
const resultsBadge    = document.getElementById('resultsBadge');
const resultsBody     = document.getElementById('resultsBody');
const closeResultsBtn = document.getElementById('closeResults');

const cardsGrid       = document.getElementById('cardsGrid');
const cardMap = {
  number: document.getElementById('cardNumber'),
  aadhar: document.getElementById('cardAadhar'),
  email:  document.getElementById('cardEmail')
};
const inputMap = {
  number: document.getElementById('numberInput'),
  aadhar: document.getElementById('aadharInput'),
  email:  document.getElementById('emailInput')
};

// ── 3. MOBILE SIDEBAR DRAWER TOGGLE ───────────────────────────
function openSidebar() {
  if (sidebar) sidebar.classList.add('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  document.body.style.overflow = window.innerWidth <= 1024 ? 'hidden' : '';
}

function closeSidebar() {
  if (sidebar) sidebar.classList.remove('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

if (menuToggle) menuToggle.addEventListener('click', openSidebar);
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

// Close drawer on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSidebar();
  }
});

// ── 4. TOOL NAVIGATION (SIDEBAR, BOTTOM DOCK, FILTER PILLS) ───
let currentActiveTool = 'all';

function switchTool(toolName, shouldFocusInput = true) {
  currentActiveTool = toolName;

  // 1. Update Sidebar Buttons
  document.querySelectorAll('.side-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === toolName);
  });

  // 2. Update Mobile Bottom Dock Buttons
  document.querySelectorAll('.mobile-dock-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === toolName);
  });

  // 3. Update Hero Filter Pills
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === toolName);
  });

  const upcomingSection = document.getElementById('upcomingSection');
  const cardsSection = document.getElementById('cardsSection');

  // 4. Update Cards display
  if (toolName === 'upcoming') {
    if (cardsSection) cardsSection.style.display = 'none';
    if (upcomingSection) {
      upcomingSection.style.display = 'block';
      upcomingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else if (toolName === 'all') {
    if (cardsSection) cardsSection.style.display = 'block';
    if (upcomingSection) upcomingSection.style.display = 'block';
    cardsGrid.classList.remove('single-tool-view');
    Object.values(cardMap).forEach(card => {
      if (card) {
        card.style.display = 'flex';
        card.classList.remove('focused-card');
      }
    });
  } else {
    // number, aadhar, email
    if (cardsSection) cardsSection.style.display = 'block';
    if (upcomingSection) upcomingSection.style.display = 'none';
    cardsGrid.classList.add('single-tool-view');
    Object.entries(cardMap).forEach(([name, card]) => {
      if (card) {
        if (name === toolName) {
          card.style.display = 'flex';
          card.classList.add('focused-card');
        } else {
          card.style.display = 'none';
          card.classList.remove('focused-card');
        }
      }
    });

    // Scroll to the card smoothly
    const targetCard = cardMap[toolName];
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Auto focus the input field for high-speed typing
    if (shouldFocusInput && inputMap[toolName]) {
      setTimeout(() => {
        inputMap[toolName].focus();
      }, 250);
    }
  }

  // Close mobile sidebar if open
  closeSidebar();
}

// Bind Sidebar buttons
document.querySelectorAll('.side-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchTool(tab.dataset.tool);
  });
});

// Bind Sidebar Upcoming mini-list items
document.querySelectorAll('.sidebar-upcoming-item').forEach(item => {
  item.addEventListener('click', () => {
    switchTool('upcoming');
  });
});

// Bind Mobile Dock buttons
document.querySelectorAll('.mobile-dock-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTool(btn.dataset.tool);
  });
});

// Bind Filter Pills in Hero
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    switchTool(pill.dataset.filter);
  });
});

// Header quick nav links
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-scroll');
    const toolName = targetId.replace('card', '').toLowerCase();
    switchTool(toolName);
  });
});

// ── 5. RESULTS PANEL HANDLER ──────────────────────────────────
if (closeResultsBtn) {
  closeResultsBtn.addEventListener('click', () => {
    resultsSection.style.display = 'none';
    resultsBody.innerHTML = '';
  });
}

// ── 6. DATA SANITIZATION HELPER (Removes 'by' and '@ftgamer2') ─
function sanitizeClientData(data) {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeClientData);
  }
  if (typeof data === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(data)) {
      if (k.toLowerCase() === 'by' || k.toLowerCase().includes('ftgamer')) continue;
      if (typeof v === 'string' && (v.includes('ftgamer2') || v.includes('@ftgamer2'))) continue;
      clean[k] = sanitizeClientData(v);
    }
    return clean;
  }
  if (typeof data === 'string') {
    return data.replace(/@?ftgamer2/gi, '').trim();
  }
  return data;
}

// Detect API base URL: if hosted on GitHub Pages or static host, route requests to Vercel backend
const API_BASE = (window.location.hostname.includes('github.io'))
  ? 'https://darkie-zone.vercel.app'
  : '';

// ── 7. SHARED FETCH & LOOKUP ENGINE ───────────────────────────
async function doLookup(endpoint, payload, badgeText, badgeClass) {
  // Show results panel with sleek spinner
  resultsSection.style.display = 'block';
  resultsBadge.textContent = badgeText;
  resultsBadge.className   = `results-badge ${badgeClass}`;
  resultsBody.innerHTML    = `
    <div class="state-loading">
      <div class="spinner"></div>
      <br/>Querying encrypted database...
    </div>`;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const rawData = await res.json();
    return sanitizeClientData(rawData);
  } catch (err) {
    resultsBody.innerHTML = `<div class="state-error">❌ Network error — unable to reach the server.</div>`;
    return null;
  }
}

// Helper: Row rendering
function row(label, value) {
  const v = (value === null || value === undefined || value === '') ? '<span style="opacity:.35">—</span>' : value;
  return `<div class="result-row"><span class="r-label">${label}</span><span class="r-value">${v}</span></div>`;
}

function cleanAddress(addr) {
  if (!addr) return '—';
  return addr.split('!').map(s => s.trim()).filter(Boolean).join(', ');
}

// ── 8. NUMBER LOOKUP ──────────────────────────────────────────
const numberBtn = document.getElementById('numberBtn');
if (numberBtn) {
  numberBtn.addEventListener('click', async () => {
    const input = document.getElementById('numberInput');
    const num = input.value.trim();

    if (!/^\d{10}$/.test(num)) {
      showInline('numberInput', '⚠️ Enter a valid 10-digit mobile number');
      return;
    }

    numberBtn.classList.add('loading');
    numberBtn.innerHTML = '⏳ Searching...';

    const data = await doLookup('/api/number', { num }, `📞 NUMBER: +91 ${num}`, 'green');

    numberBtn.classList.remove('loading');
    numberBtn.innerHTML = '<span class="btn-icon">🔍</span> SEARCH NUMBER';

    if (!data) return;

    if (data.success) {
      const results = Array.isArray(data.results) ? data.results
                    : data.data ? [data.data]
                    : [data];

      let truecallerBadge = data.truecaller_name ? `<span class="summary-chip chip-status">⚡ Truecaller: ${data.truecaller_name}</span>` : '';
      let html = `
        <div class="result-summary">
          <span class="summary-chip chip-aadhar">📞 +91 ${num}</span>
          <span class="summary-chip chip-count">📋 ${results.length} Record(s)</span>
          ${truecallerBadge}
        </div>
        <div class="result-grid">`;

      results.forEach((r, i) => {
        const fieldMap = {
          name:          '👤 Name',
          mobile:        '📱 Mobile',
          number:        '📱 Number',
          operator:      '📡 Operator',
          circle:        '🗺️ Circle',
          state:         '🗺️ State',
          type:          '📲 Type',
          telecom:       '📡 Telecom',
          location:      '📍 Location',
          fname:         '👨 Father Name',
          father_name:   '👨 Father Name',
          alt:           '📞 Alternate',
          alternate:     '📞 Alternate',
          id:            '🆔 Aadhaar / ID',
          aadhar:        '🆔 Aadhaar',
          email:         '📧 Email',
          dob:           '🎂 DOB',
          gender:        '⚧️ Gender',
          status:        '✅ Status',
          address:       '🏠 Address'
        };

        let rowsHTML = '';
        for (const [key, label] of Object.entries(fieldMap)) {
          if (r[key] !== undefined && r[key] !== 'N/A' && r[key] !== null && r[key] !== '') {
            rowsHTML += row(label, key === 'address' ? cleanAddress(r[key]) : r[key]);
          }
        }
        for (const [key, val] of Object.entries(r)) {
          if (key.toLowerCase() === 'by' || key.toLowerCase().includes('ftgamer')) continue;
          if (typeof val === 'string' && val.toLowerCase().includes('ftgamer2')) continue;
          if (!fieldMap[key] && typeof val !== 'object' && val !== 'N/A' && val !== null && val !== '') {
            rowsHTML += row(`📌 ${key}`, val);
          }
        }

        html += `
          <div class="result-card">
            <div class="result-card-num">#${i + 1}</div>
            <div class="result-meta">${rowsHTML || row('Info', JSON.stringify(r))}</div>
          </div>`;
      });

      html += `</div>`;
      resultsBody.innerHTML = html;
    } else {
      resultsBody.innerHTML = `
        <div class="state-error">❌ ${data.error || data.message || 'No data found.'}</div>
        <pre class="raw-json" style="color:#00ff41;background:rgba(0,0,0,0.6);padding:12px;border-radius:8px;font-family:Share Tech Mono;font-size:12px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
    }
  });
}

// ── 9. AADHAAR LOOKUP ─────────────────────────────────────────
const aadharBtn = document.getElementById('aadharBtn');
if (aadharBtn) {
  aadharBtn.addEventListener('click', async () => {
    const input = document.getElementById('aadharInput');
    const num = input.value.trim();

    if (!/^\d{12}$/.test(num)) {
      showInline('aadharInput', '⚠️ Enter exactly 12 numeric digits');
      return;
    }

    aadharBtn.classList.add('loading');
    aadharBtn.innerHTML = '⏳ Searching...';

    const data = await doLookup('/api/aadhar', { num }, `🆔 AADHAAR: ${num}`, 'red');

    aadharBtn.classList.remove('loading');
    aadharBtn.innerHTML = '<span class="btn-icon">🔍</span> SEARCH AADHAAR';

    if (!data) return;

    if (data.success && Array.isArray(data.results) && data.results.length > 0) {
      const total = data.total || data.results.length;

      let html = `
        <div class="result-summary">
          <span class="summary-chip chip-aadhar">🆔 ${data.aadhar || num}</span>
          <span class="summary-chip chip-count">📋 ${total} Record(s) Found</span>
        </div>
        <div class="result-grid">`;

      data.results.forEach((r, i) => {
        html += `
          <div class="result-card" style="border-color: rgba(255, 59, 59, 0.25);">
            <div class="result-card-num">#${i + 1}</div>
            <div class="result-meta">
              ${row('👤 Name',         r.name)}
              ${row('👨 Father Name',  r.father_name || r.fname)}
              ${row('📱 Mobile',       r.mobile)}
              ${row('📞 Alternate',    r.alternate || r.alt)}
              ${row('📧 Email',        r.email)}
              ${row('📡 Circle',       r.circle)}
              ${row('🆔 Aadhaar',      r.aadhar || r.id)}
              ${row('🏠 Address',      cleanAddress(r.address))}
            </div>
          </div>`;
      });

      html += `</div>`;
      resultsBody.innerHTML = html;
    } else if (data.error || data.message) {
      resultsBody.innerHTML = `<div class="state-error">❌ ${data.error || data.message}</div>`;
    } else {
      resultsBody.innerHTML = `
        <div class="state-empty">⚠️ No records found.</div>
        <pre class="raw-json" style="color:#ff5555;background:rgba(0,0,0,0.6);padding:12px;border-radius:8px;font-family:Share Tech Mono;font-size:12px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
    }
  });
}

// ── 10. EMAIL LOOKUP ──────────────────────────────────────────
const emailBtn = document.getElementById('emailBtn');
if (emailBtn) {
  emailBtn.addEventListener('click', async () => {
    const input = document.getElementById('emailInput');
    const email = input.value.trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      showInline('emailInput', '⚠️ Enter a valid email address');
      return;
    }

    emailBtn.classList.add('loading');
    emailBtn.innerHTML = '⏳ Searching...';

    const data = await doLookup('/api/email', { email }, `📧 EMAIL: ${email}`, 'blue');

    emailBtn.classList.remove('loading');
    emailBtn.innerHTML = '<span class="btn-icon">🔍</span> SEARCH EMAIL';

    if (!data) return;

    if (data.success) {
      const results = Array.isArray(data.results) ? data.results
                    : data.data ? [data.data]
                    : [data];

      let html = `
        <div class="result-summary">
          <span class="summary-chip chip-aadhar" style="border-color:rgba(0,180,255,.35);color:#00b4ff;background:rgba(0,180,255,.1)">📧 ${email}</span>
          <span class="summary-chip chip-count">📋 ${results.length} Record(s)</span>
        </div>
        <div class="result-grid">`;

      results.forEach((r, i) => {
        const fieldMap = {
          name:         '👤 Name',
          email:        '📧 Email',
          provider:     '🌐 Provider',
          status:       '✅ Status',
          location:     '📍 Location',
          mobile:       '📱 Mobile',
          social:       '👤 Social',
          breach:       '⚠️ Breach',
          aadhar:       '🆔 Aadhaar',
          address:      '🏠 Address',
          dob:          '🎂 DOB',
          gender:       '⚧️ Gender',
          father_name:  '👨 Father Name',
          alternate:    '📞 Alternate',
          circle:       '📡 Circle',
        };

        let rowsHTML = '';
        for (const [key, label] of Object.entries(fieldMap)) {
          if (r[key] !== undefined && r[key] !== 'N/A' && r[key] !== null && r[key] !== '') {
            rowsHTML += row(label, key === 'address' ? cleanAddress(r[key]) : r[key]);
          }
        }
        for (const [key, val] of Object.entries(r)) {
          if (key.toLowerCase() === 'by' || key.toLowerCase().includes('ftgamer')) continue;
          if (typeof val === 'string' && val.toLowerCase().includes('ftgamer2')) continue;
          if (!fieldMap[key] && typeof val !== 'object' && val !== 'N/A' && val !== null && val !== '') {
            rowsHTML += row(`📌 ${key}`, val);
          }
        }

        html += `
          <div class="result-card" style="border-color:rgba(0,180,255,.25)">
            <div class="result-card-num">#${i + 1}</div>
            <div class="result-meta">${rowsHTML || row('Info', JSON.stringify(r))}</div>
          </div>`;
      });

      html += `</div>`;
      resultsBody.innerHTML = html;
    } else {
      resultsBody.innerHTML = `
        <div class="state-error">❌ ${data.error || data.message || 'No data found.'}</div>
        <pre class="raw-json" style="color:#00b4ff;background:rgba(0,0,0,0.6);padding:12px;border-radius:8px;font-family:Share Tech Mono;font-size:12px;overflow:auto;">${JSON.stringify(data, null, 2)}</pre>`;
    }
  });
}

// ── 11. KEYBOARD ENTER KEY SUPPORT ────────────────────────────
['numberInput', 'aadharInput', 'emailInput'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (id === 'numberInput') numberBtn.click();
      if (id === 'aadharInput') aadharBtn.click();
      if (id === 'emailInput') emailBtn.click();
    }
  });
});

// ── 12. INLINE WARNING HELPER ─────────────────────────────────
function showInline(inputId, msg) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const old = document.getElementById(inputId + '_warn');
  if (old) old.remove();

  const el = document.createElement('div');
  el.id = inputId + '_warn';
  el.style.cssText = 'font-size:12px;color:#ff5555;padding:6px 2px;font-family:Share Tech Mono,monospace;letter-spacing:0.5px;animation:fadeIn 0.2s;';
  el.textContent = msg;

  const card = input.closest('.card');
  if (card) {
    const group = card.querySelector('.input-group');
    if (group) group.after(el);
  }

  setTimeout(() => el.remove(), 3500);
  input.focus();
}

// ── ADMIN CONTACT PANEL ─────────────────────────────────────────
(function () {
  const floatBtn   = document.getElementById('adminFloatBtn');
  const panel      = document.getElementById('adminPanel');
  const closeBtn   = document.getElementById('adminPanelClose');
  const backdrop   = document.getElementById('adminBackdrop');

  function openPanel() {
    panel.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    panel.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (floatBtn)  floatBtn.addEventListener('click', openPanel);
  if (closeBtn)  closeBtn.addEventListener('click', closePanel);
  if (backdrop)  backdrop.addEventListener('click', closePanel);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
      closePanel();
    }
  });
})();