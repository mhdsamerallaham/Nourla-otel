/**
 * Database Module - SQLite Data Access & Migration Engine
 */

'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const defaultDbPath = isVercel
  ? path.join('/tmp', 'nourla_hotel.sqlite')
  : path.join(__dirname, 'nourla_hotel.sqlite');

const DB_PATH = process.env.DATABASE_PATH || defaultDbPath;
const MIGRATION_PATH = path.join(__dirname, '../../database/migrations/001_initial_schema.sql');

const FALLBACK_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS HOTELS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pms_hotel_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT 'NOURLA',
  currency VARCHAR(10) DEFAULT 'TRY',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ROOMS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER NOT NULL,
  pms_room_type_id INTEGER NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_tr TEXT,
  description_en TEXT,
  image_url VARCHAR(500),
  size_m2 VARCHAR(50),
  max_adults INTEGER DEFAULT 2,
  max_children INTEGER DEFAULT 0,
  base_price DECIMAL(10, 2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS RESERVATIONS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_code VARCHAR(100) UNIQUE NOT NULL,
  reservation_uuid VARCHAR(100) UNIQUE,
  hotel_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  pms_room_type_id INTEGER NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  rate_plan VARCHAR(100) DEFAULT 'STANDARD',
  board_type_id INTEGER DEFAULT 893,
  rate_type_id INTEGER DEFAULT 792,
  rate_code_id INTEGER DEFAULT 6844,
  price_agency_id INTEGER DEFAULT 44573,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  night_count INTEGER NOT NULL,
  adult_count INTEGER DEFAULT 2,
  child_count INTEGER DEFAULT 0,
  base_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  sync_status VARCHAR(50) DEFAULT 'SYNC_PENDING',
  pms_reservation_id VARCHAR(100),
  pms_reservation_uuid VARCHAR(100),
  sync_attempts INTEGER DEFAULT 0,
  last_sync_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS RESERVATION_GUESTS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT 0,
  gender INTEGER DEFAULT 0,
  country VARCHAR(10) DEFAULT 'TR',
  special_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS PAYMENTS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_code VARCHAR(100) UNIQUE NOT NULL,
  reservation_id INTEGER NOT NULL,
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'mock',
  gateway_transaction_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'PENDING',
  idempotency_key VARCHAR(255) UNIQUE,
  masked_card_number VARCHAR(30),
  card_holder_name VARCHAR(100),
  error_code VARCHAR(100),
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS PAYMENT_TRANSACTIONS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  reservation_id INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) NOT NULL,
  provider_code VARCHAR(50),
  response_payload_sanitized TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS PAYMENT_CALLBACKS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  provider VARCHAR(50) NOT NULL,
  callback_status VARCHAR(50) NOT NULL,
  payload_hash VARCHAR(255) NOT NULL,
  processed BOOLEAN DEFAULT 0,
  raw_body_sanitized TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

let db = null;

function getDbConnection() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('[DATABASE ERROR] Failed to connect to SQLite DB:', err.message);
      } else {
        console.log(`[DATABASE] Connected to SQLite database at: ${DB_PATH}`);
      }
    });
  }
  return db;
}

function runQuery(sql, params = []) {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    connection.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    connection.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function execSqlScript(sqlScript) {
  const connection = getDbConnection();
  return new Promise((resolve, reject) => {
    connection.exec(sqlScript, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

async function initializeDatabase() {
  try {
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
    console.error('[DATABASE INIT ERROR]', err.message);
    throw err;
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
