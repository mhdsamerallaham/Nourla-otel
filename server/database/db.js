/**
 * Database Module - SQLite Data Access & Migration Engine
 */

'use strict';

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'nourla_hotel.sqlite');
const MIGRATION_PATH = path.join(__dirname, '../../database/migrations/001_initial_schema.sql');

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
      console.warn('[DATABASE] Migration file not found at:', MIGRATION_PATH);
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
