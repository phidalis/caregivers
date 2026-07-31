// ==========================================
// MERCY SENIOR SOLUTIONS - Email Notification Server
// Serves the static website AND sends emails through Resend.
//
// DEPLOYED ON RENDER:
// - Environment variables are set in the Render dashboard (see setup steps).
// - The static site and the /api/send-email endpoint share the same domain,
//   so the pages call the API with a relative URL (no CORS issues).
// ==========================================

const path = require('path');
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Environment variables (set in the Render dashboard) ----
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mercy Senior Solutions <onboarding@resend.dev>';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const staticDir = __dirname;

// Trust Render's proxy so req.ip is the real visitor IP (used for rate limiting)
app.set('trust proxy', 1);

// ---- CORS ----
app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(',').map(function(s) { return s.trim(); })
}));
app.use(express.json({ limit: '1mb' }));

// ---- Simple in-memory rate limiter (per IP) ----
const rateBuckets = {};
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 30;                   // max 30 requests per window per IP

function rateLimited(ip) {
  const now = Date.now();
  const bucket = rateBuckets[ip];
  if (!bucket || now - bucket.resetAt > RATE_WINDOW_MS) {
    rateBuckets[ip] = { count: 1, resetAt: now + RATE_WINDOW_MS };
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_MAX;
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ---- API: health check (useful to confirm the server is running) ----
app.get('/api/health', function(req, res) {
  res.json({
    ok: true,
    emailConfigured: !!RESEND_API_KEY,
    from: FROM_EMAIL,
    defaultAdmin: DEFAULT_ADMIN_EMAIL
  });
});

// ---- API: send email(s) through Resend ----
// Expected body: {
//   messages: [{ to, subject, html }, ...],
//   replyTo: 'optional@email.com'
// }
app.post('/api/send-email', async function(req, res) {
  try {
    if (!RESEND_API_KEY) {
      return res.status(500).json({ ok: false, error: 'RESEND_API_KEY is not configured on the server.' });
    }

      if (rateLimited(req.ip)) {
        return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
      }

    const messages = req.body.messages;
    const replyTo = req.body.replyTo;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ ok: false, error: 'No messages provided.' });
    }
    if (messages.length > 10) {
      return res.status(400).json({ ok: false, error: 'Too many messages in one request.' });
    }

    const resend = new Resend(RESEND_API_KEY);
    const results = [];

    for (const msg of messages) {
      const to = String(msg.to || '').trim();
      const subject = String(msg.subject || '').trim();
      const html = String(msg.html || '');

      if (!isValidEmail(to)) {
        results.push({ to, ok: false, error: 'Invalid recipient email.' });
        continue;
      }
      if (!subject) {
        results.push({ to, ok: false, error: 'Missing subject.' });
        continue;
      }

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        replyTo: replyTo || undefined,
        subject,
        html
      });

      if (error) {
        results.push({ to, ok: false, error: error.message });
      } else {
        results.push({ to, ok: true, id: data && data.id });
      }
    }

    return res.json({ ok: true, results });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ---- Static website ----
// Only public website files may be downloaded. Server source files and
// config files are never exposed.
const BLOCKED_FILES = [
  'package.json', 'package-lock.json', 'server.js',
  '.env', '.env.example', '.gitignore', 'render.yaml', 'README.md',
  'firebase.json', 'firestore.rules', 'firestore.indexes.json'
];

app.use(function(req, res, next) {
  if (req.path.indexOf('/api/') === 0) return next();
  const file = req.path.split('?')[0].split('#')[0];
  if (file === '/') return next();

  const lower = file.toLowerCase();
  if (lower.indexOf('/node_modules/') === 0 || lower.indexOf('/.git/') === 0) {
    return res.status(404).send('Not found');
  }

  const base = file.split('/').pop().toLowerCase();
  if (BLOCKED_FILES.indexOf(base) !== -1) {
    return res.status(404).send('Not found');
  }
  if (!/\.(html|css|js|json|png|jpg|jpeg|svg|webp|gif|ico|woff2?|map)$/.test(lower)) {
    return res.status(404).send('Not found');
  }
  next();
});

app.use(express.static(staticDir, { extensions: ['html'] }));

app.get('/', function(req, res) {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, function() {
  console.log('Mercy Senior Solutions server running on port ' + PORT);
  if (RESEND_API_KEY) {
    console.log('Resend email API configured. From: ' + FROM_EMAIL);
  } else {
    console.log('WARNING: RESEND_API_KEY is not set. Email sending is disabled.');
  }
});
