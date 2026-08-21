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
const app = require('./app');

const PORT = process.env.PORT || 3001;

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
      console.log(`║  Hotel ID: ${(process.env.ELEKTRA_HOTEL_ID || '37555').padEnd(39)}║`);
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

