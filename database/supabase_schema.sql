-- =============================================================================
-- NOURLA BOUTIQUE HOTEL - SUPABASE (POSTGRESQL) SCHEMA
-- Copy and paste this script directly into Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yghiynqrtstvchtcaeml/sql/new
-- =============================================================================

-- 1. HOTELS
CREATE TABLE IF NOT EXISTS HOTELS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pms_hotel_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT 'NOURLA',
  currency VARCHAR(10) DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. ROOMS
CREATE TABLE IF NOT EXISTS ROOMS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id BIGINT NOT NULL,
  pms_room_type_id BIGINT NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL,
  name_tr VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description_tr TEXT,
  description_en TEXT,
  image_url VARCHAR(500),
  size_m2 VARCHAR(50),
  max_adults INT DEFAULT 2,
  max_children INT DEFAULT 0,
  base_price NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id) ON DELETE CASCADE
);

-- 3. ROOM_RATES
CREATE TABLE IF NOT EXISTS ROOM_RATES (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id BIGINT NOT NULL,
  rate_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  board_type VARCHAR(50) DEFAULT 'RO',
  board_type_id INT DEFAULT 893,
  rate_type_id INT DEFAULT 792,
  rate_code_id INT DEFAULT 6844,
  price_agency_id INT DEFAULT 44573,
  price_per_night NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES ROOMS(id) ON DELETE CASCADE
);

-- 4. AVAILABILITY_CACHE
CREATE TABLE IF NOT EXISTS AVAILABILITY_CACHE (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id BIGINT NOT NULL,
  pms_room_type_id BIGINT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  available_count INT DEFAULT 0,
  price_per_night NUMERIC(10, 2) DEFAULT 0.00,
  total_price NUMERIC(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'TRY',
  cached_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id) ON DELETE CASCADE
);

-- 5. CANCELLATION_POLICIES
CREATE TABLE IF NOT EXISTS CANCELLATION_POLICIES (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  hotel_id BIGINT NOT NULL,
  room_id BIGINT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  refundable BOOLEAN DEFAULT TRUE,
  cancellation_deadline_hours INT DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES ROOMS(id) ON DELETE SET NULL
);

-- 6. RESERVATIONS
CREATE TABLE IF NOT EXISTS RESERVATIONS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_code VARCHAR(100) UNIQUE NOT NULL,
  reservation_uuid VARCHAR(100) UNIQUE,
  hotel_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  pms_room_type_id BIGINT NOT NULL,
  room_name VARCHAR(255) NOT NULL,
  rate_plan VARCHAR(100) DEFAULT 'STANDARD',
  board_type_id INT DEFAULT 893,
  rate_type_id INT DEFAULT 792,
  rate_code_id INT DEFAULT 6844,
  price_agency_id INT DEFAULT 44573,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  night_count INT NOT NULL,
  adult_count INT DEFAULT 2,
  child_count INT DEFAULT 0,
  base_price NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'PENDING_PAYMENT',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  sync_status VARCHAR(50) DEFAULT 'SYNC_PENDING',
  pms_reservation_id VARCHAR(100),
  pms_reservation_uuid VARCHAR(100),
  sync_attempts INT DEFAULT 0,
  last_sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES HOTELS(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES ROOMS(id) ON DELETE RESTRICT
);

-- 7. RESERVATION_GUESTS
CREATE TABLE IF NOT EXISTS RESERVATION_GUESTS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id BIGINT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  gender INT DEFAULT 0,
  country VARCHAR(10) DEFAULT 'TR',
  special_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(id) ON DELETE CASCADE
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS PAYMENTS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_code VARCHAR(100) UNIQUE NOT NULL,
  reservation_id BIGINT NOT NULL,
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'mock',
  gateway_transaction_id VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'PENDING',
  idempotency_key VARCHAR(255) UNIQUE,
  masked_card_number VARCHAR(30),
  card_holder_name VARCHAR(100),
  error_code VARCHAR(100),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(id) ON DELETE RESTRICT
);

-- 9. PAYMENT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS PAYMENT_TRANSACTIONS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  reservation_id BIGINT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  status VARCHAR(50) NOT NULL,
  provider_code VARCHAR(50),
  response_payload_sanitized TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES PAYMENTS(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(id) ON DELETE CASCADE
);

-- 10. PAYMENT_EVENTS
CREATE TABLE IF NOT EXISTS PAYMENT_EVENTS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  reservation_id BIGINT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES PAYMENTS(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES RESERVATIONS(id) ON DELETE CASCADE
);

-- 11. PAYMENT_CALLBACKS
CREATE TABLE IF NOT EXISTS PAYMENT_CALLBACKS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id BIGINT NOT NULL,
  provider VARCHAR(50) NOT NULL,
  callback_status VARCHAR(50) NOT NULL,
  payload_hash VARCHAR(255) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  raw_body_sanitized TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES PAYMENTS(id) ON DELETE CASCADE
);

-- 12. IDEMPOTENCY_KEYS
CREATE TABLE IF NOT EXISTS IDEMPOTENCY_KEYS (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  response_data TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_rooms_pms ON ROOMS(pms_room_type_id);
CREATE INDEX IF NOT EXISTS idx_avail_dates ON AVAILABILITY_CACHE(pms_room_type_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_res_code ON RESERVATIONS(reservation_code);
CREATE INDEX IF NOT EXISTS idx_res_status ON RESERVATIONS(status, payment_status, sync_status);
CREATE INDEX IF NOT EXISTS idx_res_pms ON RESERVATIONS(pms_reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_res ON PAYMENTS(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON PAYMENTS(status);
CREATE INDEX IF NOT EXISTS idx_payments_code ON PAYMENTS(payment_code);
CREATE INDEX IF NOT EXISTS idx_pay_tx_payment ON PAYMENT_TRANSACTIONS(payment_id);
CREATE INDEX IF NOT EXISTS idx_pay_cb_hash ON PAYMENT_CALLBACKS(payload_hash);
CREATE INDEX IF NOT EXISTS idx_idempotency_hash ON IDEMPOTENCY_KEYS(key_hash);

-- =============================================================================
-- SEED INITIAL HOTEL & ROOM DEFINITIONS
-- =============================================================================
INSERT INTO HOTELS (pms_hotel_id, name, code, currency)
VALUES ('37555', 'Nourla Boutique Hotel', 'NOURLA', 'TRY')
ON CONFLICT (pms_hotel_id) DO NOTHING;

INSERT INTO ROOMS (hotel_id, pms_room_type_id, code, name_tr, size_m2, max_adults, base_price)
VALUES
  (1, 3219, 'STD', 'Standart Oda', '38 m²', 2, 320.00),
  (1, 3220, 'TSR', 'Tasarım Oda', '44 m²', 2, 380.00),
  (1, 3221, 'STSR', 'Superior Tasarım Oda', '52 m²', 2, 450.00),
  (1, 3222, 'SUIT', 'Süit Oda', '60 m²', 3, 550.00),
  (1, 3223, 'LOFT', 'Loft Villa', '85 m²', 3, 750.00)
ON CONFLICT (pms_room_type_id) DO NOTHING;
