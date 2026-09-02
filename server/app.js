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
const { securityHeaders } = require('./middleware/securityHeaders');

const elektraRoutes = require('./routes/elektra');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const sitemapRoutes = require('./routes/sitemap');

const app = express();

// Disable X-Powered-By to prevent server technology fingerprinting
app.disable('x-powered-by');

// Trust proxy for Vercel / reverse proxy deployment
app.set('trust proxy', 1);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Katı CORS Yapılandırması ─────────────────────────────────────────────────
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/www\.nourla\.com\.tr$/,
  /^https?:\/\/nourla\.com\.tr$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    // Mobil uygulamalar, sunucu-içi çağrılar veya aynı kaynaktan gelen istekler (no origin)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin)) || origin === FRONTEND_URL;
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Bu kaynak üzerinden erişim yetkiniz bulunmamaktadır.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 saatlik preflight cache
};

// 1. HTTP Güvenlik Başlıkları (OWASP / HSTS / CSP)
app.use(securityHeaders);

// 2. CORS ve Body Parsing
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requestLogger);

// Dynamic Sitemap Endpoint for Googlebot
app.use('/', sitemapRoutes);

// ─── Rate Limiting (Katmanlı — endpoint önemine göre) ────────────────────────

// 1. Genel API limiti — tüm /api/ için (1 dk içinde max 300 istek — takvim ve oda gezintisi için)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.',
    },
  },
});

// 2. Kritik yazma işlemleri — rezervasyon & ödeme (1 dk içinde max 15 istek)
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla rezervasyon/ödeme isteği. Lütfen 1 dakika bekleyip tekrar deneyin.',
    },
  },
});

// 3. Okuma ağırlıklı endpoint'ler — fiyat & müsaitlik (1 dk içinde max 300 istek)
const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Çok fazla istek gönderildi. Lütfen kısa bir süre bekleyin.',
    },
  },
});

// Genel limit: tüm /api/ rotaları
app.use('/api/', apiLimiter);

// Sıkı limit: rezervasyon oluşturma ve ödeme işlemleri
app.use('/api/booking/reservation', strictLimiter);
app.use('/api/payment/', strictLimiter);

// Orta limit: fiyat ve müsaitlik sorguları (takvim her ay geçişinde çağrılır)
app.use('/api/booking/price', readLimiter);
app.use('/api/booking/availability', readLimiter);

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

// Global Error Handler (Security: Never leak stack traces or internal DB errors to client)
app.use((err, req, res, _next) => {
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      success: false,
      error: { code: 'CORS_FORBIDDEN', message: 'Yetkisiz erişim kaynağı (CORS).' },
    });
  }

  // Log internal error to server stdout for debugging
  console.error('[SERVER ERROR]', err.message || err);

  const status = Number(err.httpStatus || err.status || 500);
  const isClientError = status >= 400 && status < 500;

  return res.status(status).json({
    success: false,
    error: {
      code: err.code || (isClientError ? 'INVALID_REQUEST' : 'INTERNAL_SERVER_ERROR'),
      message: isClientError ? err.message : 'İşlem sırasında bir aksaklık meydana geldi. Lütfen tekrar deneyiniz.',
    },
  });
});

module.exports = app;
