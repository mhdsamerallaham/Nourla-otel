# 🏨 Nourla Boutique Hotel — Web Sitesi & API Entegrasyon Dokümantasyonu

> **Urla, İzmir** | Lüks Butik Otel | Elektraweb PMS Entegrasyonu

---

## 📌 Proje Özeti

Nourla Boutique Hotel'in çok dilli kurumsal web sitesi ve Elektraweb PMS rezervasyon entegrasyonunu içeren tam stack projedir.

| Alan | Detay |
|------|-------|
| **Otel Adı** | Nourla Boutique Hotel |
| **Konum** | Urla, İzmir, Türkiye |
| **Hotel ID (Elektraweb)** | 37555 |
| **Diller** | TR 🇹🇷 / EN 🇬🇧 / DE 🇩🇪 / RU 🇷🇺 |
| **Oda Sayısı** | 10 Bespoke Oda |

---

## 🏗️ Mimari

```
Browser (React SPA)
       ↓
Nourla Frontend   (Vite + React 18 — port :5173)
       ↓  /api/elektra/*  (dev: Vite proxy)
Nourla Backend    (Node.js + Express — port :3001)
       ↓  Authorization: Bearer JWT
Elektraweb BookingAPI   (https://bookingapi.elektraweb.com)
       ↓
Elektraweb PMS
```

### Güvenlik Katmanı
- Token **yalnızca** backend `server/.env` içinde
- Frontend hiçbir zaman Elektraweb ile doğrudan iletişim kurmaz
- JWT her gün yenilenir, backend in-memory cache'de tutulur
- CORS sadece frontend origin'e izin verir

---

## 📁 Proje Yapısı

```
Nourla-otel-main/
├── src/                          # Frontend (Vite + React)
│   ├── App.jsx                   # Router & layout
│   ├── main.jsx                  # Entry point
│   ├── i18n.js                   # i18next konfigürasyonu
│   ├── index.css                 # Global stiller
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   └── ui/
│   │       ├── BookingWidget.jsx  # Rezervasyon formu (Elektraweb bağlantılı)
│   │       ├── RoomCard.jsx
│   │       ├── RoomInspectModal.jsx
│   │       ├── BackgroundMusic.jsx
│   │       └── ...
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Rooms.jsx
│   │   ├── RoomDetail.jsx
│   │   ├── Reservation.jsx
│   │   ├── About.jsx
│   │   ├── Gallery.jsx
│   │   ├── Contact.jsx
│   │   ├── Sustainability.jsx
│   │   └── UrlaGuide.jsx
│   ├── data/
│   │   ├── rooms.js              # Oda tanımları
│   │   └── ...
│   ├── services/
│   │   └── api.js                # [PHASE 1] Frontend→Backend API client
│   └── locales/
│       ├── tr.json
│       ├── en.json
│       ├── de.json
│       └── ru.json
│
├── server/                       # [PHASE 1] Backend (Node.js + Express)
│   ├── index.js
│   ├── package.json
│   ├── .env                      # ⚠️ GİT'E COMMIT ETME
│   ├── .env.example
│   ├── services/
│   │   └── elektraweb/
│   │       ├── index.js          # Servis metodları
│   │       ├── client.js         # Axios HTTP client
│   │       └── auth.js           # JWT token manager
│   ├── routes/
│   │   └── elektra.js
│   ├── middleware/
│   │   ├── validation.js
│   │   └── logger.js
│   └── utils/
│       └── responseNormalizer.js
│
├── public/nourla/                # Oda görselleri
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 🔌 Elektraweb API Endpointleri

> **Resmi Base URL:** `https://bookingapi.elektraweb.com`
> **Hotel ID:** `375075`
> **Docs:** https://hotel.docs.bookingapi.elektraweb.com/
> **Auth:** `Authorization: Bearer <JWT_TOKEN>`

### Authentication
```
POST /login
Body: { "email": "<email>", "password": "<password>" }
Response: { "success": true, "token": "<JWT_TOKEN>" }
```

### Hotel Definitions
```
GET /hotel/375075/definition        # Room types, board types, rates
GET /hotel/375075/params            # Booking policies
GET /hotel/375075/exchange-rate     # Para birimleri
GET /hotel/375075/extra-services    # Ekstra hizmetler
```

### Price & Availability
```
GET /hotel/375075/price/
  ?fromdate=YYYY-MM-DD
  &todate=YYYY-MM-DD
  &adult=2
  &childage=4,7        (opsiyonel)
  &currency=EUR
  &nationality=TR
  &language=tr
  &onlybestoffer=true
  &promo-code=         (opsiyonel)

GET /hotel/375075/availability
  ?fromdate=YYYY-MM-DD
  &todate=YYYY-MM-DD
```

### System Lists
```
GET /cities
GET /countries
GET /std-board-type
```

### Reservation (2. Aşama — Henüz Aktif Değil)
```
POST /hotel/375075/createReservation
POST /hotel/375075/updateReservation
POST /hotel/375075/createServiceReservation
```

---

## 🌐 Backend Endpointlerimiz

| Endpoint | Açıklama | Durum |
|----------|----------|-------|
| `GET /api/elektra/health` | Bağlantı testi | Aşama 1 |
| `GET /api/elektra/hotel-definitions` | Otel tanımları | Aşama 1 |
| `GET /api/elektra/availability` | Müsaitlik | Aşama 1 |
| `GET /api/elektra/price` | Fiyat | Aşama 1 |
| `POST /api/elektra/reservation` | Rezervasyon oluştur | Aşama 2 |

---

## 🗄️ Veritabanı Yapısı

> **Aşama 1:** Veritabanı yok (read-only, Elektraweb'den canlı veri)
> **Aşama 2:** Rezervasyon sistemi için aşağıdaki tablolar eklenecek

### `elektra_room_mapping`
```sql
id                    INTEGER PRIMARY KEY
our_room_id           VARCHAR(100)   -- rooms.js id (ör: "olive-grove-suite")
elektra_room_type_id  INTEGER        -- Elektraweb roomTypeId
name_tr / en / de / ru VARCHAR(200)
capacity              INTEGER
active                BOOLEAN DEFAULT 1
created_at / updated_at DATETIME
```

### `elektra_rate_mapping`
```sql
id                    INTEGER PRIMARY KEY
elektra_rate_type_id  INTEGER
elektra_rate_code_id  INTEGER
elektra_board_type_id INTEGER
name_tr / en          VARCHAR(200)
active                BOOLEAN DEFAULT 1
created_at            DATETIME
```

### `elektra_sync_log`
```sql
id            INTEGER PRIMARY KEY
endpoint      VARCHAR(200)
hotel_id      INTEGER
status_code   INTEGER
duration_ms   INTEGER
success       BOOLEAN
error_message TEXT
created_at    DATETIME
```

### `reservations` (Aşama 2)
```sql
id                      INTEGER PRIMARY KEY
elektra_reservation_id  VARCHAR(100)
hotel_id / room_type_id / rate_type_id / board_type_id  INTEGER
check_in / check_out    DATE
adult_count             INTEGER
child_ages              VARCHAR(100)   -- JSON: "[4,7]"
currency                VARCHAR(10)
total_price             DECIMAL(10,2)
status                  VARCHAR(50)    -- PENDING, CONFIRMED, CANCELLED
contact_name / email / phone VARCHAR
nationality             VARCHAR(10)
special_notes           TEXT
payment_type            INTEGER        -- 2=NOT PAID, 3=PAID
created_at / updated_at DATETIME
```

---

## ⚙️ Environment Variables

### `server/.env` ⚠️ Git'e commit etme!
```
ELEKTRA_API_BASE_URL=https://bookingapi.elektraweb.com
ELEKTRA_HOTEL_ID=375075
ELEKTRA_API_TOKEN=YOUR_SECRET_TOKEN_HERE

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### `server/.env.example` (commit edilebilir)
```
ELEKTRA_API_BASE_URL=https://bookingapi.elektraweb.com
ELEKTRA_HOTEL_ID=375075
ELEKTRA_API_TOKEN=

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Kurulum & Çalıştırma

### Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Backend
```bash
cd server
npm install
cp .env.example .env
# .env içine ELEKTRA_API_TOKEN yaz
npm start
# → http://localhost:3001
```

### Bağlantı Testleri
```bash
curl http://localhost:3001/api/elektra/health
curl http://localhost:3001/api/elektra/hotel-definitions
curl "http://localhost:3001/api/elektra/availability?fromdate=2026-08-25&todate=2026-08-28"
curl "http://localhost:3001/api/elektra/price?fromdate=2026-08-25&todate=2026-08-28&adult=2&currency=EUR"
```

---

## 📋 Geliştirme Aşamaları

### ✅ Aşama 0 — Frontend Web Sitesi (TAMAMLANDI)
- [x] Vite + React 18, Tailwind CSS v4
- [x] 4 dilli i18n (TR/EN/DE/RU)
- [x] React Router v6 URL-bazlı dil yönlendirmesi
- [x] 10 oda tanımı (rooms.js hardcoded)
- [x] BookingWidget (simüle edilmiş müsaitlik)
- [x] Tüm sayfalar tamamlandı
- [x] Vercel deployment konfigürasyonu

### 🔄 Aşama 1 — Elektraweb Read-Only Entegrasyonu (TAMAMLANDI)

**Başlangıç:** 2026-08-21

- [x] Proje analizi tamamlandı
- [x] Elektraweb API dokümantasyonu okundu
- [x] API endpoint listesi çıkarıldı
- [x] Mimari tasarımı yapıldı
- [x] README.md oluşturuldu
- [x] `server/` Express backend kurulumu
[x] Environment variables yapısı
[x] Elektraweb auth service (JWT manager)
[x] HTTP client (timeout, retry)
[x] Backend routeları (health, definitions, availability, price)
[x] Response normalizer
[x] Vite proxy konfigürasyonu
[x] `src/services/api.js` frontend client
- [ ] BookingWidget → gerçek API bağlantısı
- [x] TEST 1: Hotel definitions ✅ (HTTP 200)
- [x] TEST 2: Availability ✅ (HTTP 200)
- [x] TEST 3: Price ✅ (HTTP 200)

**Önemli Notlar (Aşama 1):**
- Elektraweb base URL: `https://bookingapi.elektraweb.com`
- Auth flow: POST `/login` → JWT → Bearer header
- Token cache: Backend in-memory, günde 1 yenile
- `ELEKTRA_API_TOKEN` → login credentials veya API key (`server/.env`)
- Timeout: 15 saniye
- Retry: max 2 (sadece GET)

### ⏳ Aşama 2 — Rezervasyon Sistemi (PLANLI)
- [ ] `createReservation` entegrasyonu
- [ ] Double booking koruması
- [ ] Ödeme entegrasyonu
- [ ] Veritabanı kurulumu
- [ ] E-posta bildirimleri

### ⏳ Aşama 3 — Admin Paneli (PLANLI)
- [ ] Oda/rate mapping yönetimi
- [ ] Rezervasyon listesi
- [ ] Sync logları görüntüleme

---

## 📦 Teknoloji Stack

### Frontend
| Paket | Sürüm |
|-------|-------|
| react | ^18.3.1 |
| vite | ^5.4.11 |
| tailwindcss | ^4.0.0 |
| react-router-dom | ^6.28.0 |
| framer-motion | ^11.11.17 |
| i18next | ^23.16.8 |
| lucide-react | ^0.460.0 |

### Backend (Aşama 1)
| Paket | Kullanım |
|-------|----------|
| express | HTTP server |
| axios | HTTP client |
| dotenv | Env variables |
| cors | CORS |
| express-rate-limit | Rate limiting |

---

## 🔐 Güvenlik

- `ELEKTRA_API_TOKEN` → sadece `server/.env`
- Token frontend response'larda bulunmaz
- Token log'larda maskelenir (`***`)
- `.env` → `.gitignore`'da
- CORS → sadece `FRONTEND_URL` origin
- Rate limiting aktif

---

*Son güncelleme: 2026-08-21 — Aşama 1 devam ediyor*

