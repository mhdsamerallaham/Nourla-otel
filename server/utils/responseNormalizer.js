/**
 * Response Normalizer
 *
 * Elektraweb'den gelen raw response'ları frontend için normalize eder.
 *
 * Elektraweb PMS Real Schema for Price:
 * [
 *   {
 *     "room-type-id": 3219,
 *     "room-type": "Standart Room",
 *     "board-type-id": 893,
 *     "board-type": "RO",
 *     "rate-type-id": 792,
 *     "rate-type": "Ref",
 *     "price": 36944.16,
 *     "currency": "TRY",
 *     "days-count": 2,
 *     "room-to-sell": 2,
 *     "price-arr": [18472.08, 18472.08],
 *     "availability-arr": [2, 2]
 *   }
 * ]
 */

'use strict';

const HOTEL_ID = process.env.ELEKTRA_HOTEL_ID || '37555';

/**
 * Hotel Definitions response'unu normalize eder.
 */
function normalizeHotelDefinitions(raw) {
  return {
    success: true,
    hotelId: parseInt(HOTEL_ID, 10),
    data: raw,
    roomTypes: extractRoomTypes(raw),
    boardTypes: extractBoardTypes(raw),
    rateTypes: extractRateTypes(raw),
  };
}

/**
 * Availability response'unu normalize eder.
 */
function normalizeAvailability(raw, fromdate, todate) {
  const rooms = extractAvailabilityRooms(raw);

  return {
    success: true,
    hotelId: parseInt(HOTEL_ID, 10),
    checkIn: fromdate,
    checkOut: todate,
    rooms,
    raw,
  };
}

/**
 * Price response'unu normalize eder.
 */
function normalizePrice(raw, params) {
  const offers = extractPriceOffers(raw);

  return {
    success: true,
    hotelId: parseInt(HOTEL_ID, 10),
    checkIn: params.fromdate,
    checkOut: params.todate,
    nights: params.nights || null,
    adults: params.adult,
    currency: params.currency || 'TRY',
    offers,
    raw,
  };
}

// ─── Extractor Helpers ────────────────────────────────────────────────────────

function extractRoomTypes(raw) {
  const list = raw?.roomtype || raw?.roomTypes || raw?.RoomTypes || raw?.data?.roomtype || [];
  if (!Array.isArray(list)) return [];
  return list.map((r) => {
    // Handle both proper JSON object (from axios) and PowerShell @{...} string format
    const roomRules = r['room-rules'];
    const capacity = parsePmsCapacity(roomRules);

    return {
      id: r['room-id'] || r.id,
      name: r['room-name'] || r.name,
      code: r['room-code'] || r.code,
      bedCount: parseInt(r['room-bed-count'] || r.bedCount || 1, 10),
      imageUrl: r['room-image-url'] || r.imageUrl || null,
      area: r['room-area'] || r.area || null,
      hasWifi: parseBool(r['room-has-wifi']),
      hasSafe: parseBool(r['room-has-safe']),
      hasPrivateBath: parseBool(r['room-has-private-bath']),
      hasHairdryer: parseBool(r['room-has-hairdryer']),
      hasBalcony: parseBool(r['room-has-balcony']),
      maxAdults: capacity.maxAdults,
      maxChildren: capacity.maxChildren,
      maxPax: capacity.maxPax,
    };
  });
}

/**
 * ElektraWeb'den gelen kapasite verisini parse eder.
 * İki format desteklenir:
 *   1. JSON object: { "max-adult-capacity": 2, ... }
 *   2. PowerShell string: "@{max-adult-capacity=2; max-child-capacity=0; ...}"
 */
function parsePmsCapacity(roomRules) {
  const defaults = { maxAdults: 2, maxChildren: 0, maxPax: 2 };

  if (!roomRules) return defaults;

  // Proper JSON object
  if (typeof roomRules === 'object') {
    return {
      maxAdults: parseInt(roomRules['max-adult-capacity'] ?? roomRules.maxAdultCapacity ?? 2, 10),
      maxChildren: parseInt(roomRules['max-child-capacity'] ?? roomRules.maxChildCapacity ?? 0, 10),
      maxPax: parseInt(roomRules['max-pax-capacity'] ?? roomRules.maxPaxCapacity ?? 2, 10),
    };
  }

  // PowerShell @{key=value; key=value} format
  if (typeof roomRules === 'string' && roomRules.startsWith('@{')) {
    const inner = roomRules.slice(2, -1); // Remove @{ and }
    const pairs = inner.split(';').map((s) => s.trim()).filter(Boolean);
    const obj = {};
    pairs.forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v !== undefined) obj[k.trim()] = v.trim();
    });
    return {
      maxAdults: parseInt(obj['max-adult-capacity'] || 2, 10),
      maxChildren: parseInt(obj['max-child-capacity'] || 0, 10),
      maxPax: parseInt(obj['max-pax-capacity'] || 2, 10),
    };
  }

  return defaults;
}

function parseBool(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return Boolean(val);
}


function extractBoardTypes(raw) {
  const list = raw?.boardtypes || raw?.boardTypes || raw?.data?.boardtypes || [];
  if (!Array.isArray(list)) return [];
  return list.map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    sysCode: b['sys-code'] || b.sysCode,
  }));
}

function parseBoardType(boardName, boardTypeId) {
  const str = String(boardName || '').toUpperCase().trim();

  // If RO / Sadece Oda / Room Only
  if (str === 'RO' || str.includes('ROOM ONLY') || str.includes('SADECE') || str === 'RO-01') {
    return {
      code: 'RO',
      includesBreakfast: false,
      title: {
        tr: 'Sadece Oda (Kahvaltısız)',
        en: 'Room Only (No Breakfast)',
        de: 'Nur Übernachtung (Ohne Frühstück)',
        ru: 'Только проживание (Без завтрака)',
      },
    };
  }

  // If HB (Half Board)
  if (str === 'HB' || str.includes('HALF') || str.includes('YARIM')) {
    return {
      code: 'HB',
      includesBreakfast: true,
      title: {
        tr: 'Yarım Pansiyon (Kahvaltı & Akşam Yemeği Dahil)',
        en: 'Half Board (Breakfast & Dinner Included)',
        de: 'Halbpension (Inklusive Frühstück & Abendessen)',
        ru: 'Полупансион (Завтрак ve Ужин включены)',
      },
    };
  }

  // Default for Nourla Boutique Hotel: BB (Bed & Breakfast / Kahvaltı Dahil)
  return {
    code: 'BB',
    includesBreakfast: true,
    title: {
      tr: 'Zengin Organik Ege Kahvaltısı Dahil',
      en: 'Rich Organic Aegean Breakfast Included',
      de: 'Inklusive Organisches Bio-Frühstück',
      ru: 'Органический эгейский завтрак включен',
    },
  };
}

function extractRateTypes(raw) {
  const list = raw?.ratetypes || raw?.rateTypes || raw?.data?.ratetypes || [];
  if (!Array.isArray(list)) return [];
  return list.map((rt) => ({
    id: rt.id,
    code: rt.code,
    cancellationPossible: rt['cancellation-possible'] ?? rt.cancellationPossible ?? true,
    payNowPercent: rt['pay-now-percent'] ?? 100,
  }));
}

function extractAvailabilityRooms(raw) {
  if (Array.isArray(raw)) {
    return raw.map((r) => ({
      roomTypeId: r['room-type-id'] || r.roomTypeId,
      roomName: r['room-type'] || r.roomName,
      available: r['room-to-sell'] ?? r.available ?? 0,
      availabilityArr: r['availability-arr'] || [],
    }));
  }
  return [];
}

function extractPriceOffers(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map((offer) => {
    const roomTypeId = offer['room-type-id'] || offer.roomTypeId;
    const roomName = offer['room-type'] || offer.roomName;
    const boardTypeId = offer['board-type-id'] || offer.boardTypeId;
    const rawBoardName = offer['board-type'] || offer.boardName || 'BB';
    const rateTypeId = offer['rate-type-id'] || offer.rateTypeId;
    const rateName = offer['rate-type'] || offer.rateType;
    const rateCodeId = offer['rate-code-id'] || offer.rateCodeId || 6844;
    const priceAgencyId = offer['price-agency-id'] || offer.priceAgencyId || 44573;
    const daysCount = offer['days-count'] || 1;

    // ElektraWeb net price (the true payable price and amount sent to PMS)
    const rawDiscountedPrice = parseFloat(offer['discounted-price'] || offer.discountedPrice || 0);
    const rawRackPrice = parseFloat(offer.price || offer.totalPrice || 0);
    const rawElektraPrice = rawDiscountedPrice > 0 ? rawDiscountedPrice : rawRackPrice;

    // Web 5% Discount Mathematical Formula:
    // If ElektraWeb already provides rack price, use it; otherwise DISPLAY_OLD_PRICE = ELEKTRA_PRICE / 0.95
    const originalPrice = rawRackPrice > rawElektraPrice 
      ? rawRackPrice 
      : (rawElektraPrice > 0 ? parseFloat((rawElektraPrice / 0.95).toFixed(2)) : 0);
    const totalPrice = rawElektraPrice;
    const discountAmount = parseFloat((originalPrice - totalPrice).toFixed(2));
    const discountPercent = originalPrice > 0 ? Math.round(((originalPrice - totalPrice) / originalPrice) * 100) : 5;

    const priceArr = offer['price-arr'] || offer.priceArr || [];
    const availabilityArr = offer['availability-arr'] || offer.availabilityArr || [];
    const pricePerNight = priceArr[0] || (daysCount ? parseFloat((totalPrice / daysCount).toFixed(2)) : 0);
    const originalPricePerNight = originalPrice > 0 ? parseFloat((originalPrice / daysCount).toFixed(2)) : pricePerNight;
    const availableRooms = offer['room-to-sell'] ?? offer.availableRooms ?? 0;
    const currency = (offer.currency || 'TRY').toUpperCase();

    // Parse board/pension type details (Kahvaltılı vs Kahvaltısız)
    const boardInfo = parseBoardType(rawBoardName, boardTypeId);

    return {
      roomTypeId,
      roomName,
      boardTypeId,
      boardName: rawBoardName,
      boardCode: boardInfo.code,
      includesBreakfast: boardInfo.includesBreakfast,
      boardTitle: boardInfo.title,
      rateTypeId,
      rateName,
      rateCodeId,
      priceAgencyId,
      totalPrice,
      originalPrice,
      displayPrice: originalPrice,
      discountAmount,
      discountPercent,
      hasDiscount: true,
      pricePerNight,
      originalPricePerNight,
      daysCount,
      priceArr,
      availabilityArr,
      availableRooms,
      currency,
      rawOffer: offer,
    };
  });
}

function normalizeError(err) {
  if (err.name === 'ElektraError') {
    return {
      success: false,
      error: {
        code: err.code || 'ELEKTRA_API_ERROR',
        message: err.message || 'Elektraweb API hatası oluştu.',
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Sunucu hatası oluştu.',
    },
  };
}

module.exports = {
  normalizeHotelDefinitions,
  normalizeAvailability,
  normalizePrice,
  normalizeError,
};
