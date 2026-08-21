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
    const boardName = offer['board-type'] || offer.boardName;
    const rateTypeId = offer['rate-type-id'] || offer.rateTypeId;
    const rateName = offer['rate-type'] || offer.rateType;
    const totalPrice = offer.price || offer.totalPrice || 0;
    const daysCount = offer['days-count'] || 1;
    const pricePerNight = offer['price-arr']?.[0] || Math.round((totalPrice / daysCount) * 100) / 100;
    const availableRooms = offer['room-to-sell'] ?? 0;
    const currency = offer.currency || 'TRY';

    return {
      roomTypeId,
      roomName,
      boardTypeId,
      boardName,
      rateTypeId,
      rateName,
      totalPrice,
      pricePerNight,
      daysCount,
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
