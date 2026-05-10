require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { testAllRouters } = require('./services/mikrotik');

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARES ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Raw body pour vérification signature Wave webhook
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting sur les routes publiques
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Trop de requêtes. Réessayez dans 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives de connexion.' }
});

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter,   require('./routes/auth'));
app.use('/api/forfaits',   publicLimiter, require('./routes/forfaits'));
app.use('/api/commandes',  publicLimiter, require('./routes/commandes'));
app.use('/api/tickets',                   require('./routes/tickets'));
app.use('/api/routeurs',                  require('./routes/routeurs'));
app.use('/api/stats',                     require('./routes/stats'));
app.use('/webhooks',                      require('./webhooks/wave'));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NetPass Pro API',
    timestamp: new Date().toISOString()
  });
});

// ── ERROR HANDLER ─────────────────────────────────────────────────────────────
app.use(require('./middlewares/errorHandler'));

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n╔══════════════════════════════════╗`);
  console.log(`║   NetPass Pro API — Port ${PORT}   ║`);
  console.log(`╚══════════════════════════════════╝\n`);

  // Test connexion routeurs au démarrage
  console.log('Vérification des routeurs MikroTik...');
  await testAllRouters();
});

module.exports = app;
