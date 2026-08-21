/**
 * Vercel Serverless Function Entry Point — Nourla Hotel API
 */

'use strict';

// Default fallback environment variables for Vercel deployment
process.env.ELEKTRA_API_BASE_URL = process.env.ELEKTRA_API_BASE_URL || 'https://bookingapi.elektraweb.com';
process.env.ELEKTRA_HOTEL_ID = process.env.ELEKTRA_HOTEL_ID || '37555';
process.env.ELEKTRA_API_TOKEN =
  process.env.ELEKTRA_API_TOKEN ||
  'urlawebsitesi#37555$011da0257ad34e12acfce8ea2ad2727f63fbd8157dc6eebabdc105b8d80185b0253ee9e65ee8f74e41b846702cc7a2cd5104c2267e44f4d916f0c6404bdb6175';
process.env.PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'mock';

const app = require('../server/app');
const { initializeDatabase } = require('../server/database/db');

// Lazy initialization of database for Serverless cold starts
let dbInitialized = false;

module.exports = async (req, res) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error('[VERCEL DB INIT ERROR]', err.message);
    }
  }
  return app(req, res);
};
