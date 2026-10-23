/**
 * ForanAPI Central Backend Server & Release Distribution
 * Zero-dependency: Built with Node.js native http, crypto, fs, and node:sqlite.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');
const RELEASES_DIR = path.join(__dirname, 'public', 'releases');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(RELEASES_DIR)) fs.mkdirSync(RELEASES_DIR, { recursive: true });

// Initialize SQLite Database
const dbPath = path.join(DATA_DIR, 'foranapi.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS devices (
    machine_id TEXT PRIMARY KEY,
    user_email TEXT,
    os TEXT,
    platform TEXT,
    app_version TEXT,
    hostname TEXT,
    ip_address TEXT,
    is_guest INTEGER DEFAULT 1,
    launch_count INTEGER DEFAULT 1,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    machine_id TEXT,
    user_email TEXT,
    event_type TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
  );
`);

// Password helper
function hashPassword(password, salt = 'foranapi_secure_salt_2026') {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

// JSON Body Parser helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2e6) req.socket.destroy(); // 2MB limit
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Response helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Serve public icons
  if (['/icon.svg', '/icon.png', '/icon.ico', '/favicon.ico'].includes(pathname)) {
    const iconName = pathname === '/favicon.ico' ? 'icon.ico' : path.basename(pathname);
    const iconFile = path.join(__dirname, 'public', iconName);
    if (fs.existsSync(iconFile)) {
      const mime = iconName.endsWith('.svg') ? 'image/svg+xml' : iconName.endsWith('.png') ? 'image/png' : 'image/x-icon';
      res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' });
      return fs.createReadStream(iconFile).pipe(res);
    }
  }

  // 1. File Downloads for Auto-Updater & Website Links (/releases/...)
  if (pathname.startsWith('/releases/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(RELEASES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      return res.end('File not found in releases directory');
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': filename.endsWith('.yml') ? 'text/yaml' : 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
      });
      return fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': filename.endsWith('.yml') ? 'text/yaml' : 'application/octet-stream',
        'Content-Disposition': filename.endsWith('.exe') ? `attachment; filename="${filename}"` : 'inline',
        'Access-Control-Allow-Origin': '*',
        'Accept-Ranges': 'bytes',
      });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // 2. Auth: Register (/api/auth/register)
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const data = await parseBody(req);
    const { email, password, name, machine_id, os, platform, app_version, hostname } = data;

    if (!email || !password || !name) {
      return sendJson(res, 400, { error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return sendJson(res, 409, { error: 'An account with this email already exists.' });
    }

    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, cleanEmail, name.trim(), passwordHash, now, now);

    // Track device
    if (machine_id) {
      db.prepare(`
        INSERT INTO devices (machine_id, user_email, os, platform, app_version, hostname, ip_address, is_guest, launch_count, first_seen_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        ON CONFLICT(machine_id) DO UPDATE SET
          user_email = excluded.user_email,
          is_guest = 0,
          os = excluded.os,
          platform = excluded.platform,
          app_version = excluded.app_version,
          last_seen_at = excluded.last_seen_at,
          ip_address = excluded.ip_address
      `).run(machine_id, cleanEmail, os || 'Unknown', platform || 'win32', app_version || '1.0.0', hostname || '', clientIp, now, now);
    }

    return sendJson(res, 201, {
      success: true,
      token: crypto.randomBytes(24).toString('hex'),
      user: { id: userId, email: cleanEmail, name: name.trim() },
    });
  }

  // 3. Auth: Login (/api/auth/login)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const data = await parseBody(req);
    const { email, password, machine_id, os, platform, app_version, hostname } = data;

    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!user || user.password_hash !== hashPassword(password)) {
      return sendJson(res, 401, { error: 'Invalid email or password.' });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now, user.id);

    if (machine_id) {
      db.prepare(`
        INSERT INTO devices (machine_id, user_email, os, platform, app_version, hostname, ip_address, is_guest, launch_count, first_seen_at, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)
        ON CONFLICT(machine_id) DO UPDATE SET
          user_email = excluded.user_email,
          is_guest = 0,
          os = excluded.os,
          platform = excluded.platform,
          app_version = excluded.app_version,
          last_seen_at = excluded.last_seen_at,
          ip_address = excluded.ip_address
      `).run(machine_id, cleanEmail, os || 'Unknown', platform || 'win32', app_version || '1.0.0', hostname || '', clientIp, now, now);
    }

    return sendJson(res, 200, {
      success: true,
      token: crypto.randomBytes(24).toString('hex'),
      user: { id: user.id, email: user.email, name: user.name },
    });
  }

  // 4. Telemetry: Heartbeat on App Startup (/api/telemetry/heartbeat)
  if (pathname === '/api/telemetry/heartbeat' && req.method === 'POST') {
    const data = await parseBody(req);
    const { machine_id, user_email, os, platform, app_version, hostname, is_guest = true } = data;

    if (!machine_id) {
      return sendJson(res, 400, { error: 'machine_id is required' });
    }

    const now = new Date().toISOString();
    const guestFlag = is_guest ? 1 : 0;

    db.prepare(`
      INSERT INTO devices (machine_id, user_email, os, platform, app_version, hostname, ip_address, is_guest, launch_count, first_seen_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(machine_id) DO UPDATE SET
        user_email = COALESCE(excluded.user_email, devices.user_email),
        is_guest = CASE WHEN excluded.user_email IS NOT NULL THEN 0 ELSE devices.is_guest END,
        os = excluded.os,
        platform = excluded.platform,
        app_version = excluded.app_version,
        hostname = excluded.hostname,
        ip_address = excluded.ip_address,
        launch_count = devices.launch_count + 1,
        last_seen_at = excluded.last_seen_at
    `).run(machine_id, user_email || null, os || 'Unknown', platform || 'win32', app_version || '1.0.0', hostname || '', clientIp, guestFlag, now, now);

    return sendJson(res, 200, {
      status: 'acknowledged',
      serverTime: now,
      latestVersion: '1.0.0',
    });
  }

  // 5. Admin API: Stats & Data (/api/admin/stats, /api/admin/devices)
  if (pathname === '/api/admin/stats') {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalDevices = db.prepare('SELECT COUNT(*) as count FROM devices').get().count;
    const totalGuests = db.prepare('SELECT COUNT(*) as count FROM devices WHERE is_guest = 1').get().count;
    const totalLaunches = db.prepare('SELECT SUM(launch_count) as total FROM devices').get().total || 0;

    // Active in last 15 minutes
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const activeNow = db.prepare('SELECT COUNT(*) as count FROM devices WHERE last_seen_at >= ?').get(fifteenMinAgo).count;

    return sendJson(res, 200, {
      totalUsers,
      totalDevices,
      totalGuests,
      totalLaunches,
      activeNow,
    });
  }

  if (pathname === '/api/admin/devices') {
    const devices = db.prepare(`
      SELECT d.*, u.name as user_name
      FROM devices d
      LEFT JOIN users u ON d.user_email = u.email
      ORDER BY d.last_seen_at DESC
      LIMIT 100
    `).all();

    return sendJson(res, 200, { devices });
  }

  // 6. Admin Web Dashboard (/admin or /)
  if (pathname === '/admin' || pathname === '/') {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalDevices = db.prepare('SELECT COUNT(*) as count FROM devices').get().count;
    const totalLaunches = db.prepare('SELECT SUM(launch_count) as total FROM devices').get().total || 0;
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const activeNow = db.prepare('SELECT COUNT(*) as count FROM devices WHERE last_seen_at >= ?').get(fifteenMinAgo).count;

    const devices = db.prepare(`
      SELECT d.*, u.name as user_name
      FROM devices d
      LEFT JOIN users u ON d.user_email = u.email
      ORDER BY d.last_seen_at DESC
      LIMIT 50
    `).all();

    // Check available release file
    const setupFile = fs.readdirSync(RELEASES_DIR).find((f) => f.endsWith('.exe')) || 'ForanAPI-Setup-1.0.0.exe';
    const downloadUrl = `http://${req.headers.host || 'localhost:3001'}/releases/${setupFile}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ForanAPI Central Cloud Dashboard</title>
  <link rel="icon" type="image/svg+xml" href="/icon.svg" />
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111726;
      --border: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent-blue: #38bdf8;
      --accent-green: #22c55e;
      --accent-purple: #a855f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 32px 24px; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    .brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 700; color: #fff; }
    .badge-live { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(34, 197, 94, 0.15); color: var(--accent-green); font-size: 12px; font-weight: 600; }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-green); box-shadow: 0 0 8px var(--accent-green); animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
    .stat-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
    .stat-value { font-size: 32px; font-weight: 800; color: #fff; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .card-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .btn { display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background 0.2s; border: none; cursor: pointer; }
    .btn:hover { background: #1d4ed8; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: rgba(255,255,255,0.05); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { padding: 12px 14px; background: rgba(0,0,0,0.2); color: var(--text-muted); font-weight: 600; border-bottom: 1px solid var(--border); }
    td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-user { background: rgba(56, 189, 248, 0.15); color: var(--accent-blue); }
    .badge-guest { background: rgba(148, 163, 184, 0.15); color: var(--text-muted); }
    .badge-online { background: rgba(34, 197, 94, 0.2); color: var(--accent-green); }
    .code-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 13px; color: var(--accent-blue); word-break: break-all; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="/icon.svg" alt="ForanAPI" style="width: 28px; height: 28px; object-fit: contain;" />
        <span>ForanAPI Central Management Server</span>
        <span class="badge-live"><span class="pulse-dot"></span> Live Telemetry</span>
      </div>
      <div style="display: flex; gap: 10px;">
        <a href="${downloadUrl}" class="btn" download>📥 Download Setup (${setupFile})</a>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">Active Now (Online)</div>
        <div class="stat-value" style="color: var(--accent-green);">${activeNow}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Total Registered Accounts</div>
        <div class="stat-value" style="color: var(--accent-blue);">${totalUsers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Tracked Desktop Machines</div>
        <div class="stat-value">${totalDevices}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Total App Launches</div>
        <div class="stat-value" style="color: var(--accent-purple);">${totalLaunches}</div>
      </div>
    </div>

    <!-- Website Download Integration Box -->
    <div class="card">
      <div class="card-title">
        <span>🌐 Website Download Link Integration</span>
      </div>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">
        Add this download link or HTML button to your landing page or website for your users:
      </p>
      <div class="code-box">
        &lt;a href="${downloadUrl}" class="btn-download"&gt;Download ForanAPI for Windows&lt;/a&gt;
      </div>
      <p style="color: var(--text-muted); font-size: 12px; margin-top: 8px;">
        Direct Installer Link: <strong>${downloadUrl}</strong>
      </p>
    </div>

    <!-- Users & Machines Table -->
    <div class="card">
      <div class="card-title">
        <span>Active Users & Installed Desktop Systems (${devices.length})</span>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px;" onclick="window.location.reload()">🔄 Refresh Table</button>
      </div>

      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Account</th>
              <th>Machine UUID</th>
              <th>Operating System</th>
              <th>App Version</th>
              <th>Launches</th>
              <th>IP Address</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            ${
              devices.length === 0
                ? '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 36px;">No users or devices recorded yet. Launch ForanAPI to see the first live entry!</td></tr>'
                : devices
                    .map((d) => {
                      const isOnline = new Date(d.last_seen_at).getTime() >= Date.now() - 15 * 60 * 1000;
                      return `<tr>
                        <td>${
                          isOnline
                            ? '<span class="badge badge-online">● Online</span>'
                            : '<span style="color: var(--text-muted); font-size: 11px;">Offline</span>'
                        }</td>
                        <td>${
                          d.user_email
                            ? `<span class="badge badge-user">👤 ${d.user_name || d.user_email}</span><div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${d.user_email}</div>`
                            : '<span class="badge badge-guest">Guest</span>'
                        }</td>
                        <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${d.machine_id.slice(0, 18)}...</td>
                        <td>${d.os}</td>
                        <td><span style="font-weight: 600;">v${d.app_version}</span></td>
                        <td>${d.launch_count}</td>
                        <td style="font-family: monospace; font-size: 12px;">${d.ip_address}</td>
                        <td style="font-size: 12px; color: var(--text-muted);">${new Date(d.last_seen_at).toLocaleString()}</td>
                      </tr>`;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ ForanAPI Central Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Web Dashboard: http://localhost:${PORT}/admin`);
  console.log(`📦 Auto-Update Releases: http://localhost:${PORT}/releases/`);
  console.log(`======================================================\n`);
});
