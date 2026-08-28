/**
 * Database Module - SQLite Data Access & Migration Engine
 */

'use strict';

const path = require('path');
const fs = require('fs');
let sqlite3 = null;
// Use dynamic variable string so Vercel NFT static tracer does not bundle native C++ binary
if (!process.env.VERCEL && !process.env.NOW_REGION) {
  try {
    const sqliteMod = 'sqlite3';
    sqlite3 = require(sqliteMod).verbose();
  } catch (err) {
    console.warn('[DATABASE WARNING] Native sqlite3 module not available:', err.message);
  }
}

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const defaultDbPath = isVercel
  ? path.join('/tmp', 'nourla_hotel.sqlite')
  : path.join(__dirname, 'nourla_hotel.sqlite');

const DB_PATH = process.env.DATABASE_PATH || defaultDbPath;
const MIGRATION_PATH = path.join(__dirname, '../../database/migrations/001_initial_schema.sql');

// In-memory fallback store when native sqlite3 is unavailable
const memStore = {
  hotels: [{ id: 1, pms_hotel_id: '37555', name: 'Nourla Boutique Hotel', code: 'NOURLA', currency: 'TRY' }],
  rooms: [
    { id: 1, hotel_id: 1, pms_room_type_id: 3219, code: 'STD', name_tr: 'Standart Oda', size_m2: '38 m²', max_adults: 2, base_price: 320 },
    { id: 2, hotel_id: 1, pms_room_type_id: 3220, code: 'TSR', name_tr: 'Tasarım Oda', size_m2: '44 m²', max_adults: 2, base_price: 380 },
    { id: 3, hotel_id: 1, pms_room_type_id: 3221, code: 'STSR', name_tr: 'Superior Tasarım Oda', size_m2: '52 m²', max_adults: 2, base_price: 450 },
    { id: 4, hotel_id: 1, pms_room_type_id: 3222, code: 'SUIT', name_tr: 'Süit Oda', size_m2: '60 m²', max_adults: 3, base_price: 550 },
    { id: 5, hotel_id: 1, pms_room_type_id: 3223, code: 'LOFT', name_tr: 'Loft Villa', size_m2: '85 m²', max_adults: 3, base_price: 750 },
  ],
  reservations: [],
  guests: [],
  payments: [],
  transactions: [],
  callbacks: [],
  nextId: 100,
};

let db = null;

function getDbConnection() {
  if (isVercel) return null; // On Vercel serverless, instantly use memory store to avoid binary binding issues
  if (!sqlite3) return null;
  if (!db) {
    try {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('[DATABASE ERROR] Failed to connect to SQLite DB:', err.message);
          db = null;
        } else {
          console.log(`[DATABASE] Connected to SQLite database at: ${DB_PATH}`);
        }
      });
    } catch (err) {
      console.warn('[DATABASE EXCEPTION] Fallback to memory store:', err.message);
      db = null;
    }
  }
  return db;
}

function runQuery(sql, params = []) {
  const connection = getDbConnection();
  if (!connection) {
    memStore.nextId += 1;
    const newId = memStore.nextId;
    const uppercaseSql = sql.toUpperCase();

    if (uppercaseSql.includes('INSERT INTO RESERVATIONS')) {
      const [
        reservation_code, reservation_uuid, hotel_id, room_id, pms_room_type_id,
        room_name, rate_plan, board_type_id, rate_type_id, rate_code_id, price_agency_id,
        check_in, check_out, night_count, adult_count, child_count,
        base_price, discount_amount, tax_amount, total_price, currency,
        status, payment_status, sync_status
      ] = params;
      const rec = {
        id: newId,
        reservation_code,
        reservation_uuid,
        hotel_id,
        room_id,
        pms_room_type_id,
        room_name,
        rate_plan,
        board_type_id,
        rate_type_id,
        rate_code_id,
        price_agency_id,
        check_in,
        check_out,
        night_count,
        adult_count,
        child_count,
        base_price,
        discount_amount,
        tax_amount,
        total_price,
        currency,
        status,
        payment_status,
        sync_status,
        created_at: new Date().toISOString(),
      };
      memStore.reservations.push(rec);
      return Promise.resolve({ lastID: newId, changes: 1 });
    }

    if (uppercaseSql.includes('INSERT INTO RESERVATION_GUESTS')) {
      const [reservation_id, first_name, last_name, email, phone, is_primary, country, special_notes] = params;
      memStore.guests.push({
        id: newId,
        reservation_id,
        first_name,
        last_name,
        email,
        phone,
        is_primary,
        country,
        special_notes,
      });
      return Promise.resolve({ lastID: newId, changes: 1 });
    }

    if (uppercaseSql.includes('UPDATE RESERVATIONS')) {
      if (params.length > 0) {
        const lastParam = params[params.length - 1];
        const res = memStore.reservations.find(
          (r) => String(r.id) === String(lastParam) || String(r.reservation_code) === String(lastParam)
        );
        if (res) {
          if (uppercaseSql.includes('STATUS')) res.status = params[0];
          if (uppercaseSql.includes('PAYMENT_STATUS')) res.payment_status = params[0];
          if (uppercaseSql.includes('SYNC_STATUS')) res.sync_status = params[0];
          if (uppercaseSql.includes('PMS_RESERVATION_ID')) res.pms_reservation_id = params[0];
        }
      }
      return Promise.resolve({ lastID: newId, changes: 1 });
    }

    return Promise.resolve({ lastID: newId, changes: 1 });
  }
  return new Promise((resolve, reject) => {
    connection.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  const connection = getDbConnection();
  if (!connection) {
    const uppercaseSql = sql.toUpperCase();
    if (uppercaseSql.includes('FROM HOTELS')) return Promise.resolve(memStore.hotels[0]);
    if (uppercaseSql.includes('FROM ROOMS')) {
      const pmsId = params[0];
      const match = memStore.rooms.find((r) => String(r.pms_room_type_id) === String(pmsId));
      return Promise.resolve(match || memStore.rooms[0]);
    }
    if (uppercaseSql.includes('FROM RESERVATIONS')) {
      const paramVal = params[0];
      const match = memStore.reservations.find(
        (r) => String(r.id) === String(paramVal) || String(r.reservation_code) === String(paramVal)
      );
      return Promise.resolve(match || null);
    }
    if (uppercaseSql.includes('FROM RESERVATION_GUESTS')) {
      const paramVal = params[0];
      const match = memStore.guests.find((g) => String(g.reservation_id) === String(paramVal));
      return Promise.resolve(match || null);
    }
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    connection.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  const connection = getDbConnection();
  if (!connection) {
    const uppercaseSql = sql.toUpperCase();
    if (uppercaseSql.includes('FROM ROOMS')) return Promise.resolve(memStore.rooms);
    if (uppercaseSql.includes('FROM HOTELS')) return Promise.resolve(memStore.hotels);
    if (uppercaseSql.includes('FROM RESERVATION_GUESTS')) {
      const paramVal = params[0];
      const matches = memStore.guests.filter((g) => String(g.reservation_id) === String(paramVal));
      return Promise.resolve(matches);
    }
    if (uppercaseSql.includes('FROM RESERVATIONS')) {
      return Promise.resolve(memStore.reservations);
    }
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function execSqlScript(sqlScript) {
  const connection = getDbConnection();
  if (!connection) return Promise.resolve(true);
  return new Promise((resolve, reject) => {
    connection.exec(sqlScript, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

const FALLBACK_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS HOTELS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pms_hotel_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  currency TEXT DEFAULT 'TRY'
);

CREATE TABLE IF NOT EXISTS ROOMS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER NOT NULL,
  pms_room_type_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  size_m2 TEXT,
  max_adults INTEGER DEFAULT 2,
  base_price REAL DEFAULT 0,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id)
);

CREATE TABLE IF NOT EXISTS RESERVATIONS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_code TEXT UNIQUE,
  pms_reservation_id TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  adult_count INTEGER DEFAULT 2,
  total_price REAL DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

async function initializeDatabase() {
  try {
    const connection = getDbConnection();
    if (!connection) {
      console.log('[DATABASE] SQLite native connection not active. Using in-memory store fallback.');
      return true;
    }

    if (fs.existsSync(MIGRATION_PATH)) {
      const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
      await execSqlScript(sql);
      console.log('[DATABASE] Initial schema migration executed successfully.');
    } else {
      console.log('[DATABASE] Migration file not found, executing embedded fallback schema...');
      await execSqlScript(FALLBACK_SCHEMA_SQL);
      console.log('[DATABASE] Embedded fallback schema executed successfully.');
    }

    // Seed default hotel if not exists
    const hotelIdStr = process.env.ELEKTRA_HOTEL_ID || '37555';
    const hotel = await getQuery('SELECT * FROM HOTELS WHERE pms_hotel_id = ?', [hotelIdStr]);
    if (!hotel) {
      const res = await runQuery(
        'INSERT INTO HOTELS (pms_hotel_id, name, code, currency) VALUES (?, ?, ?, ?)',
        [hotelIdStr, 'Nourla Boutique Hotel', 'NOURLA', 'TRY']
      );
      const dbHotelId = res.lastID;
      console.log(`[DATABASE] Seeded default Hotel (ID: ${dbHotelId}, PMS ID: ${hotelIdStr})`);

      // Seed initial rooms matching ROOMS_DATA
      const defaultRooms = [
        { pms_room_type_id: 3219, code: 'STD', name_tr: 'Standart Oda', size_m2: '38 m²', max_adults: 2, price: 320 },
        { pms_room_type_id: 3220, code: 'TSR', name_tr: 'Tasarım Oda', size_m2: '44 m²', max_adults: 2, price: 380 },
        { pms_room_type_id: 3221, code: 'STSR', name_tr: 'Superior Tasarım Oda', size_m2: '52 m²', max_adults: 2, price: 450 },
        { pms_room_type_id: 3222, code: 'SUIT', name_tr: 'Süit Oda', size_m2: '60 m²', max_adults: 3, price: 550 },
        { pms_room_type_id: 3223, code: 'LOFT', name_tr: 'Loft Villa', size_m2: '85 m²', max_adults: 3, price: 750 },
      ];

      for (const room of defaultRooms) {
        await runQuery(
          `INSERT OR IGNORE INTO ROOMS (hotel_id, pms_room_type_id, code, name_tr, size_m2, max_adults, base_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [dbHotelId, room.pms_room_type_id, room.code, room.name_tr, room.size_m2, room.max_adults, room.price]
        );
      }
      console.log('[DATABASE] Seeded default room definitions.');
    }
  } catch (err) {
    console.error('[DATABASE INIT WARNING]', err.message);
    return false;
  }
}

module.exports = {
  getDbConnection,
  runQuery,
  getQuery,
  allQuery,
  execSqlScript,
  initializeDatabase,
};
