require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://billbuddy.fly.dev',
  'https://*.builder.io'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o || (o.includes('*') && origin.endsWith(o.replace('*', ''))))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Household-ID'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Security headers for FinTech compliance
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json());

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve Swagger UI
const openApiDoc = YAML.parse(fs.readFileSync(__dirname + '/../openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

// --- Authentication & User Management ---
const { authRouter } = require('./auth');
const { householdsRouter } = require('./households');
const { billsRouter } = require('./bills');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', authRouter); // For /users/profile
app.use('/api/v1', householdsRouter);
app.use('/api/v1', billsRouter);
const { adminRouter } = require('./admin');
app.use('/api/v1', adminRouter);
const { realtimeRouter } = require('./realtime');
app.use('/api/v1', realtimeRouter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/readyz', (req, res) => {
  // Could add DB check here if desired
  res.json({ ready: true, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`BillBuddy Backend running on port ${PORT}`);
});
