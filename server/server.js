require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

// Security headers (relaxed for serving frontend assets)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS — aceita o domínio de produção e localhost para dev
const allowedOrigins = [
  process.env.CLIENT_URL || 'https://anyprem.store',
  'https://anyprem.store',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origem: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sanitize MongoDB queries
app.use(mongoSanitize());

// Prevent HTTP param pollution
app.use(hpp());

// Global rate limit
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Muitas requisições. Tente em 15 minutos.' },
}));

// Logger (dev only)
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/categories',    require('./routes/categories'));
app.use('/api/songs',         require('./routes/songs'));
app.use('/api/pdfs',          require('./routes/pdfs'));
app.use('/api/sync',          require('./routes/sync'));
app.use('/api/app-users',     require('./routes/appUsers'));
app.use('/api/schedule',      require('./routes/schedule'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/content',       require('./routes/content'));
app.use('/api/push',          require('./routes/push'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Error handler (deve vir ANTES do catch-all SPA) ───────
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erro interno do servidor.' });
});

// ── Serve React build in production ──────────────────────
// DEVE ficar por último — catch-all só após todas as rotas API
const clientBuild = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`));

// ── Keep-alive: evita que o serviço durma no Render free tier ─────────────────
const https = require('https');
const KEEPALIVE_URL = 'https://anyprem.store/api/health';
const KEEPALIVE_INTERVAL_MS = 8 * 60 * 1000; // 8 minutos

function pingKeepAlive() {
  https.get(KEEPALIVE_URL, (res) => {
    console.log(`[keep-alive] ping → ${KEEPALIVE_URL} | status: ${res.statusCode}`);
    res.resume(); // descarta body
  }).on('error', (err) => {
    console.warn(`[keep-alive] erro no ping: ${err.message}`);
  });
}

// Aguarda 30s após o boot para a primeira chamada, depois a cada 8min
setTimeout(() => {
  pingKeepAlive();
  setInterval(pingKeepAlive, KEEPALIVE_INTERVAL_MS);
}, 30_000);
