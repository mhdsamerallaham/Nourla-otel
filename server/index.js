/**
 * Nourla Hotel Backend — Express Server
 *
 * Architecture:
 *   Browser → Frontend (React) → THIS SERVER → Payment Gateway (Mock/Ziraat) & ElektraWeb PMS
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { requestLogger } = require('./middleware/logger');
const { initializeDatabase } = require('./database/db');
const { processPendingSyncs } = require('./services/reservation/reservationService');

const elektraRoutes = require('./routes/elektra');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// ─── Config Validation ────────────────────────────────────────────────────────
const REQUIRED_ENV = ['ELEKTRA_API_BASE_URL', 'ELEKTRA_HOTEL_ID', 'ELEKTRA_API_TOKEN'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('[STARTUP ERROR] Missing required environment variables:', missing.join(', '));
  console.error('Please copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Middleware ────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.',
    },
  },
});

app.use('/api/', apiLimiter);

// ─── Routes Mounting ──────────────────────────────────────────────────────────
app.use('/api/booking', bookingRoutes);
app.use('/api/hotel', bookingRoutes);
app.use('/api/elektra', elektraRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Nourla Hotel Booking & Payment API',
    version: '2.0.0',
    status: 'running',
    hotelId: process.env.ELEKTRA_HOTEL_ID,
    paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
    endpoints: [
      'GET  /api/booking/definitions',
      'GET  /api/booking/availability',
      'GET  /api/booking/price',
      'POST /api/booking/reservation',
      'POST /api/payment/create',
      'POST /api/payment/3d-secure',
      'POST /api/payment/callback',
      'GET  /api/payment/status/:paymentId',
      'POST /api/payment/refund',
      'POST /api/payment/cancel',
      'GET  /api/admin/reservations',
    ],
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint bulunamadı: ${req.method} ${req.path}`,
    },
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: { code: 'CORS_ERROR', message: err.message },
    });
  }

  console.error('[SERVER ERROR]', err.message);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Sunucu hatası oluştu.',
    },
  });
});

// ─── Database & Server Boot ───────────────────────────────────────────────────
async function startServer() {
  try {
    await initializeDatabase();

    // Periodic Background PMS Sync Retry Engine (Every 2 minutes)
    setInterval(() => {
      processPendingSyncs().catch((err) =>
        console.error('[PMS RETRY ENGINE ERROR]', err.message)
      );
    }, 2 * 60 * 1000);

    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════╗');
      console.log('║   Nourla Hotel API & Payment Engine Running       ║');
      console.log('╠═══════════════════════════════════════════════════╣');
      console.log(`║  Port:     ${PORT.toString().padEnd(39)}║`);
      console.log(`║  Hotel ID: ${process.env.ELEKTRA_HOTEL_ID.padEnd(39)}║`);
      console.log(`║  Provider: ${(process.env.PAYMENT_PROVIDER || 'mock').padEnd(39)}║`);
      console.log(`║  Env:      ${(process.env.NODE_ENV || 'development').padEnd(39)}║`);
      console.log('╚═══════════════════════════════════════════════════╝');
      console.log('');
      console.log('  ✓ Public Booking API: http://localhost:' + PORT + '/api/booking');
      console.log('  ✓ Payment Gateway:   http://localhost:' + PORT + '/api/payment');
      console.log('  ✓ Admin Dashboard:   http://localhost:' + PORT + '/api/admin/reservations');
      console.log('');
    });
  } catch (err) {
    console.error('[SERVER BOOT FATAL ERROR]', err.message);
    process.exit(1);
  }
}

startServer();
