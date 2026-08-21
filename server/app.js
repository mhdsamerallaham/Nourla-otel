/**
 * Nourla Hotel Backend — Express App Export
 * Serves both local Express server and Vercel Serverless Functions.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { requestLogger } = require('./middleware/logger');

const elektraRoutes = require('./routes/elektra');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── CORS Setup (Vercel & Local Support) ──────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.includes('vercel.app') ||
      origin.includes('localhost') ||
      origin === FRONTEND_URL
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive CORS for deployed clients
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
  max: 150,
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
    hotelId: process.env.ELEKTRA_HOTEL_ID || '37555',
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

module.exports = app;
