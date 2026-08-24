# 🏨 Nourla Boutique Hotel — Web Sitesi & ElektraWeb PMS API Dokümantasyonu

> **Urla, İzmir** | Lüks Butik Otel | ElektraWeb PMS Entegrasyonu | Canlı TCMB Döviz Kuru Servisi

---

## 📌 Proje Özeti & Canlı Durum

Nourla Boutique Hotel'in çok dilli kurumsal web sitesi, canlı ElektraWeb PMS entegrasyonu, TCMB canlı döviz kuru entegrasyonu ve otomatik rezervasyon senkronizasyonunu içeren full-stack web uygulamasıdır.

| Parametre | Canlı Veri / Detay |
|---|---|
| **Otel Adı** | Nourla Boutique Hotel |
| **Konum** | Urla, İzmir, Türkiye |
| **Canlı Domain** | [https://www.nourla.com.tr](https://www.nourla.com.tr) (Vercel Production) |
| **Hotel ID (ElektraWeb)** | `37555` |
| **PMS Base URL** | `https://bookingapi.elektraweb.com` |
| **Döviz Kuru Kaynağı** | TCMB Canlı XML (`https://www.tcmb.gov.tr/kurlar/today.xml`) |
| **Diller** | TR 🇹🇷 / EN 🇬🇧 / DE 🇩🇪 / RU 🇷🇺 |
| **Otomasyon Testleri** | 15/15 Entegrasyon Testi %100 PASS (`node server/tests/runAllTests.js`) |

---

## 🚀 Son Tamamlanan Geliştirmeler & Özellikler

### 1. 🎨 Özel Lüks Otel Takvim Modülü (`LuxuryDatePickerModal.jsx`)
- **Site Tasarım Konseptine %100 Uyum:** Otelin lüks konseptine uygun zeytin yeşili (`#6F7255`), krem zemin (`#FDFBF7`), serif tipografi ve özel kenarlıklar ile geliştirilmiştir.
- **Tüm Kutunun Tıklanabilirliği:** Giriş veya Çıkış Tarihi kutusunun yalnızca simgesine değil, **herhangi bir yerine** basıldığında lüks takvim penceresi açılır.
- **ElektraWeb Canlı Ay Fiyatları:** Takvim açıldığında ElektraWeb'den ilgili ayın canlı fiyat grid'i çekilir. Müsait günlerin altında canlı oda başlangıç fiyatı basılır (Örn: `18.472 ₺`).
- **Kademeli Oda Fiyatı Yansıtma:** Eğer bir tarihte en ucuz oda tipi (Örn: Tasarım Oda) dolmuşsa, takvim o gün için otelde müsait olan **bir sonraki oda tipinin canlı fiyatını** (Örn: Deluxe Oda `21.550 ₺`) yansıtır.
- **Kilitli ve Çizgili "Müsaitlik Yok" Uyarısı:** Ancak ve ancak oteldeki **TÜM oda tipleri dolduğunda** o günün üzerine belirgin kırmızı çizgi (`line-through text-rose-600`) çekilir, altında kırmızı **`Müsaitlik Yok`** basılır ve tıklanması tamamen engellenir (`disabled`).
- **Çıkış Tarihi Otomatik Seçimi:** Kullanıcı takvimden Giriş Tarihini seçtiğinde Çıkış Tarihi otomatik olarak **Check-in + 1 Gece** olarak ayarlanır ve takvim aralığı anında vurgulanır.
- **Ay Sonu Tamamlama (30 ve 31. Günler):** ElektraWeb API'sinin check-out sınırları nedeniyle ayın 30 ve 31. günlerinde yaşanan fiyat kesintisi, ay sonu devir mantığı ile çözülmüş ve ayın 30 ve 31. günleri aktifleşmiştir.
- **Akıllı Alt Aralık Sorgulama (Smart Sub-Range Lookup):** Örneğin Eylül ayının 1-15 arası kapalı, 16-30 arası açık olduğunda 30 günlük sorguya 0 teklif dönse bile sistem otomatik olarak 16-30 Eylül aralığına alt sorgu atarak 16 canlı teklifi çeker.

### 2. 💎 %100 Canlı Veri Mimarisi (Sıfır Fallback Kuralı)
- Web sitesindeki tüm oda fiyatları, müsaitlik stok sayıları ve oda nitelikleri (m², yatak sayısı, donanımlar) %100 canlı ElektraWeb PMS yanıtlarından beslenir.
- Fallback/statik veriler tamamen kaldırılmıştır; ElektraWeb'de tanımı veya stoğu bulunmayan odalar doğrudan **"Dolu / Kapalı"** olarak kilitlenir.

### 3. 🏦 TCMB Canlı Döviz Kuru Servisi (`tcmbService.js`)
- `https://www.tcmb.gov.tr/kurlar/today.xml` adresi üzerinden canlı USD ve EUR ForexSelling kurları otomatik çekilir ve `TRY`, `USD`, `EUR` geçişlerinde canlı dönüştürülür.

### 4. 🛡️ İzole Otomasyon Test Paketi (`TEST_SUITE_MOCK_PMS`)
- Local entegrasyon testleri (`node server/tests/runAllTests.js`) çalıştırıldığında testler 50ms sürede sandbox SQLite veritabanında koşar. `TEST_SUITE_MOCK_PMS = 'true'` kuralı sayesinde otomatik testler ElektraWeb canlı resepsiyon ekranına test kaydı düşürmez.
- Canlı siteden (`www.nourla.com.tr`) gelen gerçek müşteri rezervasyonları ise %100 canlı olarak ElektraWeb PMS resepsiyon paneline düşer.

---

## 🏗️ Mimari & Veri Akışı

```
[Müşteri Tarayıcısı (React SPA)]
       │
       ▼  GET /api/booking/price, definitions, exchange-rates
[Vercel Serverless / Express Backend (server/app.js)]
       ├──► [ElektraWeb BookingAPI (bookingapi.elektraweb.com)] (Hotel ID: 37555)
       ├──► [TCMB XML Servisi (tcmb.gov.tr)]
       └──► [Local/Serverless SQLite DB (db.js)]
```

---

## 📁 Proje Yapısı & Önemli Dosyalar

```
Nourla-otel-main/
├── api/
│   └── index.js                      # Vercel Serverless Function giriş noktası
├── server/                           # Express Backend & Entegrasyon Servisleri
│   ├── app.js                        # Express uygulama konfigürasyonu ve CORS izinleri
│   ├── index.js                      # Local server başlatıcı (Port 3001)
│   ├── database/
│   │   └── db.js                     # SQLite veritabanı sürücüsü ve tablo şeması
│   ├── middleware/
│   │   ├── validation.js             # Tarih ve fiyat parametre validasyonu (past date auto-fix)
│   │   └── logger.js                 # API istek loglayıcı
│   ├── routes/
│   │   ├── booking.js                # /api/booking/price, definitions, exchange-rates, reservation
│   │   └── payment.js                # /api/payment/process, callback
│   ├── services/
│   │   ├── elektraweb/
│   │   │   ├── index.js              # ElektraWeb API metodları (getPrices, createReservation)
│   │   │   ├── client.js             # HTTP Client & Auto Retry
│   │   │   └── auth.js               # JWT Token Manager (login-token & token cache)
│   │   ├── currency/
│   │   │   └── tcmbService.js        # TCMB XML Parser & Cache
│   │   ├── reservation/
│   │   │   └── reservationService.js # DB rezervasyon durum takibi & ElektraWeb sync
│   │   └── payment/
│   │       └── paymentService.js     # Ödeme işlemleri & mock/Ziraat Sanal POS gateway
│   ├── tests/
│   │   ├── runAllTests.js            # 15 senaryolu otomatik entegrasyon test paketi
│   │   └── test_nourla.sqlite        # Test veritabanı sandbox
│   └── utils/
│       └── responseNormalizer.js     # ElektraWeb ham verilerini (price-arr, availability-arr) normalize edici
│
├── src/                              # React SPA Frontend
│   ├── components/
│   │   └── ui/
│   │       ├── BookingWidget.jsx     # Ana rezervasyon modülü (Step 1 -> 4)
│   │       ├── LuxuryDatePickerModal.jsx # Özel lüks takvim modülü (Canlı ay fiyat gridi)
│   │       ├── RoomCard.jsx          # Oda kartları
│   │       └── RoomInspectModal.jsx  # ElektraWeb verileriyle detaylı oda popup'ı
│   ├── services/
│   │   └── api.js                    # Frontend API client helpers (getPrices, getTcmbRates)
│   └── locales/                      # TR / EN / DE / RU çeviri dosyaları
│
├── vercel.json                       # Vercel routing ve rewrites ayarları
├── vite.config.js                    # Vite dev server proxy konfigürasyonu
└── README.md                         # Proje dokümantasyonu
```

---

## 🗄️ Veritabanı Şeması (SQLite)

Veritabanı otomatik olarak ilk çalışma anında `server/database/db.js` tarafından ilklendirilir:

```sql
-- Rezervasyonlar Tablosu
CREATE TABLE IF NOT EXISTS RESERVATIONS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_code TEXT UNIQUE NOT NULL,
  pms_reservation_id TEXT,
  pms_room_type_id INTEGER NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  adult_count INTEGER NOT NULL DEFAULT 2,
  child_count INTEGER NOT NULL DEFAULT 0,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  special_notes TEXT,
  currency TEXT NOT NULL DEFAULT 'TRY',
  total_price REAL NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
  sync_status TEXT NOT NULL DEFAULT 'PENDING',    -- PENDING, SYNCED, SYNC_FAILED
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ödemeler Tablosu
CREATE TABLE IF NOT EXISTS PAYMENTS (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'mock',
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  gateway_response TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Entegrasyon Testlerini Çalıştırma

Tüm entegrasyon senaryolarını (stok değişimi, fiyat değişimi, 3D secure, çift ödeme koruması, ElektraWeb senkronizasyon retry mekanizması) test etmek için terminalde şu komutu çalıştırabilirsiniz:

```powershell
node server/tests/runAllTests.js
```

**Test Sonucu:**
```
=====================================================
 ALL 15 INTEGRATION TESTS PASSED SUCCESSFULLY!
=====================================================
```

---

## ⚙️ Environment Variables (Geliştirici Notu)

`server/.env` dosyasında bulunması gereken anahtar değişkenler:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://www.nourla.com.tr
DATABASE_PATH=./nourla_hotel.sqlite

# ElektraWeb PMS Bilgileri
ELEKTRA_API_BASE_URL=https://bookingapi.elektraweb.com
ELEKTRA_HOTEL_ID=37555
ELEKTRA_API_TOKEN="urlawebsitesi#37555$011da0257ad34e12acfce8ea2ad2727f63fbd8157dc6eebabdc105b8d80185b0253ee9e65ee8f74e41b846702cc7a2cd5104c2267e44f4d916f0c6404bdb6175"

# Ödeme Sağlayıcısı
PAYMENT_PROVIDER=mock
```

---

---

## 🎨 2026-08-22 — Frontend & Mobil UX Geliştirmeleri (Bu Oturum)

Aşağıdaki değişiklikler bu geliştirme oturumunda tamamlanmış ve `npm run build` ile doğrulanmıştır.

---

### ✅ 1. Hero Bölümü — Animasyon Kaldırıldı, Fotoğraf Eklendi

**Dosya:** `src/pages/Home.jsx`

- Eski `canvas` tabanlı ağır animasyon (`HeroCanvas`) kaldırıldı.
- Yerine `/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48.jpeg` görseli konuldu.
- Çok katmanlı gradient overlay (`luxury-gradient-overlay`) eklendi: hem okunabilirlik hem estetik için.
- Hero yüksekliği `min-h-[100svh]` (iOS Safari uyumlu `svh` birimi) olarak ayarlandı — taşma sorunu giderildi.

---

### ✅ 2. Arka Plan Müziği Kaldırıldı

**Dosya:** `src/App.jsx`

- `BackgroundMusic` bileşeni `App.jsx`'ten tamamen çıkarıldı.

---

### ✅ 3. Navbar (Header) Optimizasyonu

**Dosya:** `src/components/layout/Header.jsx`

- Menü linkleri `whitespace-nowrap` ile taşma engellendi.
- Responsif boşluklar: `gap-2 lg:gap-2.5 xl:gap-5 2xl:gap-7` kademeli yapıya alındı.
- **Şeffaf Hero Modu:** Scroll konumu 0 iken (hero üzerindeyken) navbar tamamen şeffaf, logo ve linkler beyaz (`text-white`) görünür.
- Scroll başlayınca: `glass-header` (backdrop blur + krem arka plan) devreye girer.
- Mobil hamburger butonu da scroll durumuna göre iki farklı stil alır (şeffaf cam veya solid bej).

---

### ✅ 4. Hero Quick Search Widget — "Lüks Konaklamanızı Planlayın"

**Dosya:** `src/pages/Home.jsx`

- Hero bölümünün altına "Lüks Konaklamanızı Planlayın" başlıklı rezervasyon arama widget'ı eklendi.
- **Giriş / Çıkış Tarihi:** `LuxuryDatePickerModal` entegrasyonuyla canlı takvim açılır.
- **Misafir Sayısı & Para Birimi:** Açılır menüler (TRY / EUR / USD).
- **"Müsait Odalar" Butonu:** Kullanıcıyı `/{lang}/reservation?checkIn=...&checkOut=...&guests=...&currency=...&step=2` URL'sine yönlendirir — `BookingWidget` 2. aşamaya (oda seçimi) doğrudan açılır.
- Mobil grid: **2 sütun** (Giriş | Çıkış, Misafir | Para), tam genişlik Ara butonu.
- Masaüstü grid: **12 sütun** orantılı düzen.

---

### ✅ 5. BookingWidget — URL Parametre Desteği

**Dosya:** `src/components/ui/BookingWidget.jsx`

- `useSearchParams` ile `checkIn`, `checkOut`, `guests`, `currency`, `step` parametreleri URL'den okunur.
- Ana sayfadaki Quick Search Widget'tan gelen seçimler otomatik olarak BookingWidget'a aktarılır.

---

### ✅ 6. Kapsamlı Mobil UX İyileştirmeleri

#### `src/index.css`
- `-webkit-text-size-adjust: 100%` — iOS metin büyütme engeli.
- `input, select, textarea { font-size: 16px }` — iOS çift-dokunma zoom önleme.
- `-webkit-tap-highlight-color: transparent` — Dokunma rengi gizlendi.
- `-webkit-font-smoothing: antialiased` — Keskin metin render.
- Scrollbar yalnızca `@media (min-width: 1024px)` içinde gösterilir (mobil ekranı kirletmez).
- `glass-header` blur değeri `12px → 16px` artırıldı, opaklık `0.85 → 0.92`.
- iOS Home Bar için `.safe-bottom` yardımcı class eklendi (`env(safe-area-inset-bottom)`).
- `.animate-fadeIn` ve `.animate-slideLeft` keyframe animasyonları tanımlandı.
- `.touch-target` — `min 44x44px` dokunma hedefi yardımcı class.

#### `src/components/ui/SectionHeader.jsx`
- Başlık font boyutu kademelendi: `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`.
- Alt boşluk: `mb-8 sm:mb-12 md:mb-16` (mobilde daha sıkı).
- Alt yazı font boyutu: `text-xs sm:text-sm md:text-base`.

#### `src/components/ui/RoomCard.jsx` ⭐ Önemli
- **`compact` prop eklendi** (varsayılan: `false`).
- **`compact={true}` modu:** Yatay kart — sol tarafta 120px sabit fotoğraf, sağda isim + manzara + butonlar. Yükseklik sabit `130px`. Özellik badge'leri ve uzun açıklama gizlenir. Mobilde 3 kart tek ekranda görünür.
- **`compact={false}` (varsayılan):** Orijinal dikey kart — Rooms sayfası ve Tablet/Desktop için değişmez.

#### `src/pages/Home.jsx`
- **Mobil (`md:hidden`):** 3 süit kartı `compact` modda dikey liste olarak gösterilir.
- **Tablet/Masaüstü (`hidden md:grid`):** Normal 2-col / 3-col grid.
- Tüm bölüm dikey padding'leri küçültüldü: `py-24 md:py-32 → py-14 sm:py-20 md:py-28`.

#### `src/pages/About.jsx`
- Üst padding: `pt-28 → pt-20 sm:pt-28`.
- Story grid gap: `gap-12 → gap-8 sm:gap-12`.
- Kart grid: `md:grid-cols-3 → sm:grid-cols-3` (daha erken responsive kırılır).

#### `src/pages/Rooms.jsx`
- Üst padding: `pt-28 → pt-20 sm:pt-28`.
- Filtre butonları yatay scroll: `overflow-x-auto -mx-4 px-4` ile mobilde taşmadan kayar.

#### `src/pages/Gallery.jsx`
- Üst padding: `pt-28 → pt-20 sm:pt-28`.
- Hero banner yüksekliği: `h-[280px] → h-[180px] sm:h-[280px] lg:h-[340px]`.
- Filtre butonları yatay scroll (Rooms.jsx ile aynı pattern).
- Masonry gap: `gap-6 → gap-4 sm:gap-6`.

#### `src/pages/RoomDetail.jsx`
- Üst padding: `pt-28 → pt-20 sm:pt-28`.
- H1 başlık: `text-3xl sm:text-5xl → text-2xl sm:text-4xl lg:text-5xl`.
- Gallery/BookingWidget gap: `gap-8 → gap-6 sm:gap-8`.

#### `src/components/layout/Footer.jsx`
- Üst padding: `pt-16 → pt-10 sm:pt-16`.
- Footer grid: `grid-cols-1 md:grid-cols-2 → grid-cols-2 lg:grid-cols-4` (mobilde 2 sütun).

---

### 🔮 Sonraki Adımlar / Yapılacaklar

1. **Ziraat Sanal POS Canlı Entegrasyonu** — Merchant/Terminal bilgileri gelince `server/.env`'e girilecek.
2. **Admin Paneli** — Rezervasyon ve senkronizasyon takip ekranı.
3. **Mobil Menü (`MobileNav.jsx`) İncelemesi** — Mevcut mobil drawer menünün UX'i değerlendirilebilir.
4. **Rezervasyon sonrası E-posta Bildirimi** — Misafire onay maili.
5. **SEO Meta Tag'leri** — Her sayfa için özel `<title>` ve `<meta description>` tamamlanabilir.

---

*Son Güncelleme: 2026-08-22 — Frontend & Mobil UX Sprint tamamlandı. Build: ✅ PASS*
