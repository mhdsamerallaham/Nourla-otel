/**
 * TCMB (Türkiye Cumhuriyet Merkez Bankası) Exchange Rates Service
 * Source: https://www.tcmb.gov.tr/kurlar/today.xml
 */

'use strict';

const axios = require('axios');

let ratesCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache

async function getTcmbExchangeRates() {
  const now = Date.now();
  if (ratesCache && now - lastCacheTime < CACHE_TTL) {
    return ratesCache;
  }

  try {
    const res = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Accept: 'application/xml, text/xml',
      },
    });

    const xml = res.data || '';

    // Regex extract USD and EUR ForexSelling
    const usdMatch = xml.match(/<Currency[^>]*Kod="USD"[^>]*>[\s\S]*?<ForexSelling>([0-9.]+)</);
    const eurMatch = xml.match(/<Currency[^>]*Kod="EUR"[^>]*>[\s\S]*?<ForexSelling>([0-9.]+)</);

    const usdRate = usdMatch && usdMatch[1] ? parseFloat(usdMatch[1]) : 47.96;
    const eurRate = eurMatch && eurMatch[1] ? parseFloat(eurMatch[1]) : 52.81;

    ratesCache = {
      success: true,
      source: 'TCMB',
      updatedAt: new Date().toISOString(),
      rates: {
        TRY: 1,
        USD: usdRate,
        EUR: eurRate,
      },
    };

    lastCacheTime = now;
    console.log(`[TCMB RATES] Updated live TCMB exchange rates: USD=${usdRate}, EUR=${eurRate}`);
    return ratesCache;
  } catch (err) {
    console.warn('[TCMB RATES WARNING] Failed to fetch TCMB xml, using fallback rates:', err.message);
    return {
      success: true,
      source: 'FALLBACK',
      updatedAt: new Date().toISOString(),
      rates: {
        TRY: 1,
        USD: 47.96,
        EUR: 52.81,
      },
    };
  }
}

module.exports = {
  getTcmbExchangeRates,
};
