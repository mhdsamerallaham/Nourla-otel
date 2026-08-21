/**
 * Validation Middleware
 *
 * - Tarih formatı doğrulama (YYYY-MM-DD)
 * - check-in < check-out kontrolü
 * - Geçmiş tarih engelleme
 * - Adult sayısı sınırlandırma
 * - Query param sanitization
 */

'use strict';

const MAX_STAY_NIGHTS = 30;
const MAX_ADULTS = 8;
const MIN_ADULTS = 1;

/**
 * YYYY-MM-DD formatını doğrular ve Date objesine çevirir.
 * @param {string} dateStr
 * @returns {{ valid: boolean, date?: Date, error?: string }}
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Tarih belirtilmedi.' };
  }

  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!ISO_DATE_REGEX.test(dateStr)) {
    return { valid: false, error: `Geçersiz tarih formatı: "${dateStr}". Beklenen: YYYY-MM-DD` };
  }

  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    return { valid: false, error: `Geçersiz tarih: "${dateStr}"` };
  }

  return { valid: true, date };
}

/**
 * Availability endpoint için tarih validasyonu.
 * GET /api/elektra/availability?fromdate=&todate=
 */
function validateAvailabilityDates(req, res, next) {
  const { fromdate, todate } = req.query;

  // fromdate kontrolü
  const fromResult = parseDate(fromdate);
  if (!fromResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FROMDATE', message: `fromdate hatası: ${fromResult.error}` },
    });
  }

  // todate kontrolü
  const toResult = parseDate(todate);
  if (!toResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TODATE', message: `todate hatası: ${toResult.error}` },
    });
  }

  const fromDate = fromResult.date;
  const toDate = toResult.date;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Geçmiş tarih kontrolü
  if (fromDate < today) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'PAST_DATE',
        message: `Check-in tarihi geçmişte olamaz. Seçilen: ${fromdate}`,
      },
    });
  }

  // check-in < check-out kontrolü
  if (fromDate >= toDate) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE_RANGE',
        message: `Check-in tarihi (${fromdate}) check-out tarihinden (${todate}) önce olmalıdır.`,
      },
    });
  }

  // Maksimum konaklama süresi
  const nights = (toDate - fromDate) / (1000 * 60 * 60 * 24);
  if (nights > MAX_STAY_NIGHTS) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MAX_STAY_EXCEEDED',
        message: `Maksimum konaklama süresi ${MAX_STAY_NIGHTS} gecedir. Seçilen: ${nights} gece.`,
      },
    });
  }

  // Parsed değerleri request'e ekle
  req.validatedDates = { fromdate, todate, fromDate, toDate, nights };
  next();
}

/**
 * Price endpoint için kapsamlı validasyon.
 * GET /api/elektra/price?fromdate=&todate=&adult=&...
 */
function validatePriceParams(req, res, next) {
  const { fromdate, todate, adult, childage, currency, nationality, language } = req.query;

  // Tarih validasyonu
  const fromResult = parseDate(fromdate);
  if (!fromResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FROMDATE', message: `fromdate hatası: ${fromResult.error}` },
    });
  }

  const toResult = parseDate(todate);
  if (!toResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TODATE', message: `todate hatası: ${toResult.error}` },
    });
  }

  const fromDate = fromResult.date;
  const toDate = toResult.date;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (fromDate < today) {
    return res.status(400).json({
      success: false,
      error: { code: 'PAST_DATE', message: `Check-in tarihi geçmişte olamaz.` },
    });
  }

  if (fromDate >= toDate) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_DATE_RANGE', message: `Check-in check-out'dan önce olmalı.` },
    });
  }

  // Adult validasyonu
  const adultNum = parseInt(adult, 10);
  if (isNaN(adultNum) || adultNum < MIN_ADULTS || adultNum > MAX_ADULTS) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ADULT_COUNT',
        message: `Yetişkin sayısı ${MIN_ADULTS}-${MAX_ADULTS} arasında olmalıdır. Girilen: ${adult}`,
      },
    });
  }

  // Childage validasyonu (opsiyonel)
  if (childage) {
    const ages = childage.split(',').map((a) => parseInt(a.trim(), 10));
    const invalidAges = ages.filter((a) => isNaN(a) || a < 0 || a > 17);
    if (invalidAges.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHILD_AGE',
          message: `Geçersiz çocuk yaşı değerleri: ${invalidAges.join(', ')}. Yaşlar 0-17 arasında olmalıdır.`,
        },
      });
    }
  }

  // Currency validasyonu (opsiyonel)
  const VALID_CURRENCIES = ['EUR', 'TRY', 'USD', 'GBP', 'RUB'];
  if (currency && !VALID_CURRENCIES.includes(currency.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_CURRENCY',
        message: `Geçersiz para birimi: "${currency}". Geçerli değerler: ${VALID_CURRENCIES.join(', ')}`,
      },
    });
  }

  // Language validasyonu (opsiyonel)
  const VALID_LANGUAGES = ['tr', 'en', 'de', 'ru'];
  if (language && !VALID_LANGUAGES.includes(language.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_LANGUAGE',
        message: `Geçersiz dil kodu: "${language}". Geçerli değerler: ${VALID_LANGUAGES.join(', ')}`,
      },
    });
  }

  const nights = (toDate - fromDate) / (1000 * 60 * 60 * 24);

  req.validatedParams = {
    fromdate,
    todate,
    fromDate,
    toDate,
    nights,
    adult: adultNum,
    childage: childage || null,
    currency: currency ? currency.toUpperCase() : 'EUR',
    nationality: nationality ? nationality.toUpperCase() : null,
    language: language ? language.toLowerCase() : 'en',
  };

  next();
}

module.exports = {
  validateAvailabilityDates,
  validatePriceParams,
};
