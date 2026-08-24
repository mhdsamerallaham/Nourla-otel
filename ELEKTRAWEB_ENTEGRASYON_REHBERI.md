# 🏨 Nourla Boutique Hotel — ElektraWeb PMS Entegrasyon Rehberi

> **Son Güncelleme:** 24 Ağustos 2026  
> **Hotel ID:** `37555`  
> **Base API URL:** `https://bookingapi.elektraweb.com`

---

## 📋 1. Entegrasyon Mimarisi Özeti

```
Kullanıcı (Browser)
     │  React Frontend (Vite)
     │  src/components/ui/BookingWidget.jsx
     │  src/services/api.js  ◄─── getPrices(), createReservation()
     │
     ▼
Express Backend (server/)
     │  server/routes/booking.js   ◄─── GET /api/booking/price
     │  server/middleware/validation.js
     │
     ▼
ElektraWeb Service Layer
     │  server/services/elektraweb/index.js    ◄─── getPrices(), createReservation()
     │  server/services/elektraweb/client.js   ◄─── elektraGet(), elektraPost()
     │  server/services/elektraweb/auth.js     ◄─── JWT token yönetimi
     │
     ▼
Response Normalizer
     │  server/utils/responseNormalizer.js
     │  normalizePrice(), extractPriceOffers()
     │
     ▼
ElektraWeb PMS API
     https://bookingapi.elektraweb.com/hotel/37555/price/
     https://bookingapi.elektraweb.com/hotel/37555/hotel-definitions
     https://bookingapi.elektraweb.com/hotel/37555/createReservation
```

---

## 🔐 2. Kimlik Doğrulama (JWT Auth)

**Dosya:** `server/services/elektraweb/auth.js`

| Parametre | Değer |
|---|---|
| Login Endpoint | `POST https://bookingapi.elektraweb.com/login` |
| Auth Yöntemi | `{ "login-token": "ELEKTRA_API_TOKEN" }` |
| JWT Cache Süresi | 24 saat (`ELEKTRA_TOKEN_CACHE_TTL=86400`) |
| Header | `Authorization: Bearer <jwt>` |

**Env değişkenleri (.env):**
```
ELEKTRA_API_TOKEN=urlawebsitesi#37555$011da0257...
ELEKTRA_HOTEL_ID=37555
ELEKTRA_API_BASE_URL=https://bookingapi.elektraweb.com
```

**Token akışı:**
1. İlk istekte `fetchNewToken()` çağrılır, JWT alınır ve memory cache'e yazılır.
2. Sonraki isteklerde cache geçerliyse `getToken()` direkt JWT döndürür.
3. 401 alınırsa `clearTokenCache()` çağrılır, yeni token alınır ve istek tekrarlanır.

---

## 🏠 3. Oda Tipleri (ElektraWeb PMS Kayıtları)

**Canlı Tanılama Sonucu (24 Ağustos 2026):**

| ElektraWeb Room ID | Oda Adı |
|---|---|
| `3219` | Standart Room |
| `3220` | Tasarım Room |
| `3221` | Superior Tasarım Room |
| `3222` | Suit Room |
| `3223` | Loft Villa |

**Sitemizde Eşleme:** `src/data/rooms.js` → `elektraRoomTypeId` alanı.

---

## 💰 4. Fiyat API'si (Price Endpoint)

**Endpoint:** `GET /hotel/37555/price/`

### Gönderilen Parametreler:

| Parametre | Tip | Açıklama |
|---|---|---|
| `fromdate` | string | Giriş tarihi `YYYY-MM-DD` |
| `todate` | string | Çıkış tarihi `YYYY-MM-DD` |
| `adult` | number | Yetişkin sayısı |
| `currency` | string | `TRY`, `USD`, `EUR` |
| `language` | string | `TR`, `EN`, `DE`, `RU` |
| `onlybestoffer` | boolean | `true` = Sadece en iyi fiyat (tavsiye) |
| `promo-code` | string | Promosyon kodu (örn: `ONLINE`) |
| `price-agency-id` | number | Acente ID (örn: `44573`) |

### ElektraWeb Raw Response Alanları (Kritik):

```json
{
  "room-type-id": 3219,
  "room-type": "Standart Room",
  "board-type-id": 893,
  "board-type": "RO",
  "rate-type-id": 792,
  "rate-type": "Ref",
  "rate-code-id": 6844,
  "rate-code": "ONLINE",
  "price-agency-id": 44573,
  "price": 67219.08,
  "discounted-price": 67219.08,
  "discount-percent": 0,
  "discount-amount": 0,
  "promotion-percent": 0,
  "room-to-sell": 2,
  "days-count": 4,
  "price-arr": [16804.77, 16804.77, 16804.77, 16804.77],
  "availability-arr": [2, 2, 2, 2],
  "currency": "TRY"
}
```

### ⚠️ Kritik Davranış — ElektraWeb İndirim Yapısı:

**ElektraWeb indirimi doğrudan `price` alanına dahil ederek döndürür.**
`discount-percent` ve `discounted-price` alanları her zaman `0` veya `price` ile aynı gelir.
İndirim, PMS tarafında hesaplanmış net fiyat olarak `price`'a yansır.
Bu, ElektraWeb'in standart ve değiştirilemez API davranışıdır.

---

## 📊 5. Pensiyon / Board Tipleri

| ElektraWeb Kodu | Anlamı | Sitemizde |
|---|---|---|
| `RO` | Room Only | Kahvaltısız |
| `BB` | Bed & Breakfast | Kahvaltılı |
| `HB` | Half Board | Yarım Pansiyon |

**Tespit mantığı:** `parseBoardType()` fonksiyonu `responseNormalizer.js`'de board-type string değerini parse ederek `includesBreakfast: true/false` üretir.

---

## 🏷️ 6. Acente & Promosyon Sistemi

**ElektraWeb PMS'deki ONLINE Acentesi:**

| Alan | Değer |
|---|---|
| Acente ID | `44573` |
| Acente Kodu | `ONLINE` |
| Acente Adı | `ONLINE Nourla` |
| Fiyat Kodu | `ONLINE` |

**Ekim 2026 İndirim Tanımı:**
```
Kod: ONLINE | Değer: ↓5% | Uygulama: 01.10.2026 — 30.10.2026
Satış Tarihi: 24.08.2026 — 30.10.2026 | Acente: 44573 (ONLINE Nourla)
```

**Canlı Test Sonucu:** ElektraWeb `promo-code=ONLINE` gönderildiğinde bile `discount-percent: 0` döndürüyor.
İndirim `price` alanına gömülmüş haldedir — bu ElektraWeb'in normal davranışıdır.

---

## 🔄 7. Normalizer Katmanı

**Dosya:** `server/utils/responseNormalizer.js` → `extractPriceOffers()`

```
Raw ElektraWeb   →   Frontend offer objesi
─────────────────────────────────────────────
offer['room-type-id']   → roomTypeId
offer['board-type']     → parseBoardType() → boardCode, includesBreakfast, boardTitle
offer.price             → totalPrice
offer['price-arr'][0]   → pricePerNight
offer['room-to-sell']   → availableRooms
offer['discount-percent'] → discountPercent (ElektraWeb genellikle 0 döndürür)
offer['rate-code']      → rateCode
offer['price-agency-id'] → priceAgencyId
```

---

## 🛒 8. Rezervasyon Oluşturma Akışı

```
BookingWidget.jsx
  → POST /api/booking/reservation
  → reservationService.createPendingReservation()
      → elektra.getPrices()  [canlı fiyat doğrulama]
      → DB INSERT RESERVATIONS [immutable snapshot]
      → elektraService.createReservation()  [PMS'e gönder]
```

**createReservation Payload:**
```json
{
  "hotel-id": 37555,
  "room-type-id": 3219,
  "board-type-id": 893,
  "rate-type-id": 792,
  "rate-code-id": 6844,
  "price-agency-id": 44573,
  "currency-code": "TRY",
  "total-price": 67219.08,
  "payment-type": 2
}
```

**Otomatik Price-Quote Retry:** ElektraWeb `total-price` uyuşmazsa hata mesajından doğru fiyatı ayıklar ve otomatik yeniden dener.

---

## 🩺 9. Canlı Tanılama Raporu (24 Ağustos 2026)

| Test | Durum | Sonuç |
|---|---|---|
| JWT Auth | ✅ TAMAM | Token 437ms'de alındı |
| Hotel Definitions | ✅ TAMAM | 5 oda tipi (3219, 3220, 3221, 3222, 3223) |
| Bugünkü Fiyatlar | ⚠️ BOŞ | Bugün müsait oda yok (Stop-sell veya takvim) |
| Ekim Fiyatları (1-5 Ekim) | ✅ TAMAM | 1 teklif — ₺67.219 / 4 gece / 2 yetişkin |
| Ekim Stok | ✅ TAMAM | Standart Room: 2 oda müsait |
| promo-code=ONLINE | ✅ BAĞLANIYOR | Fiyat dönüyor ancak discount-percent=0 |
| discount-percent algılaması | ⚠️ SINIRLI | ElektraWeb indirim alanını kullanmıyor |

---

## 🚨 10. Sorun Giderme

### Fiyatlar gelmiyor / boş liste
1. `ELEKTRA_API_TOKEN` env değişkenini kontrol et
2. ElektraWeb PMS'de ilgili tarih aralığında Stop-Sell aktif mi?
3. `onlybestoffer: false` ile tüm teklifleri gör, stop-sell olmayan var mı?

### İndirim sitemizde görünmüyor
1. ElektraWeb paneli → İndirim/Eklenti → "Aktif" kutucuğu işaretli mi?
2. Satış tarihi ve uygulama tarihinin aradığın tarihlerle örtüştüğünü doğrula
3. ElektraWeb `discount-percent=0` verse bile fiyat zaten indirimli olabilir
4. Referans fiyat ile karşılaştırarak fark varsa indirim uygulanmış demektir

### Rezervasyon oluşturulmuyor
1. PMS'deki `rate-code-id`, `board-type-id` değerleri doğru mu?
2. `total-price` ElektraWeb'in döndürdüğü fiyatla eşleşiyor mu?
3. Server loglarında `[ELEKTRA RESERVATION AUTO-QUOTE FIX]` satırı var mı?

### Tanılama komutu (proje kökünden çalıştır):
```bash
node -e "
const e = require('./server/services/elektraweb');
e.testConnection().then(r => console.log('Auth:', r));
e.getHotelDefinitions('TR').then(r => console.log('Rooms:', r?.roomtype?.length));
e.getPrices({ fromdate: '2026-10-01', todate: '2026-10-05', adult: 2, currency: 'TRY', language: 'TR' })
  .then(r => { console.log('Prices count:', r?.length); if(r?.[0]) console.log('Sample:', r[0]); });
"
```

---

## 📁 11. Kritik Dosya Haritası

| Dosya | Görev |
|---|---|
| `server/services/elektraweb/auth.js` | JWT token alma & cache |
| `server/services/elektraweb/client.js` | HTTP istekleri, retry, hata yönetimi |
| `server/services/elektraweb/index.js` | `getPrices()`, `createReservation()` |
| `server/utils/responseNormalizer.js` | Raw API → Frontend objesi dönüşümü |
| `server/routes/booking.js` | `/api/booking/price`, `/api/booking/reservation` |
| `server/services/reservation/reservationService.js` | DB snapshot + PMS sync |
| `src/services/api.js` | Frontend API istemcisi |
| `src/components/ui/BookingWidget.jsx` | Fiyat gösterimi + rezervasyon akışı |
| `src/data/rooms.js` | `elektraRoomTypeId` eşlemeleri |

---

## 🔑 12. PMS Kimlik Bilgileri Referansı

| Bilgi | Değer |
|---|---|
| Hotel ID | `37555` |
| ONLINE Acente ID | `44573` |
| ONLINE Rate Code ID | `6844` |
| Default Board Type ID (RO) | `893` |
| Default Rate Type ID (Ref) | `792` |
