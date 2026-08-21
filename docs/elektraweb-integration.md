# NOURLA BOUTIQUE HOTEL - ELEKTRAWEB PMS ENTEGRASYON DOKÜMANI

## 1. Mimari ve Gizlilik

ElektraWeb PMS entegrasyonu tamamen **Backend-to-PMS Abstraction** şeklinde kurgulanmıştır.
Frontend uygulaması hiçbir zaman doğrudan ElektraWeb API'sine istek atmaz. API Key ve Token bilgileri sadece backend ortam değişkenlerinde saklanır.

Frontend kullanıcı arayüzünde "ElektraWeb", "PMS" veya dış entegrasyon ifadeleri KESİNLİKLE gösterilmez.

---

## 2. Desteklenen Metodlar ve Katman Yapısı

`server/services/elektraweb/` klasöründe yer alan servis katmanı aşağıdaki metodları sunar:

* `getHotelDefinitions(language)`: Otel genel tanımları ve kur kurallarını çeker.
* `getAvailability(fromdate, todate)`: Belirli tarihler arasındaki oda müsaitlik durumunu sorgular.
* `getPrices(params)`: Belirli tarih ve misafir sayısı için güncel fiyat tekliflerini getirir.
* `createReservation(payload)`: Başarılı ödeme sonrası ElektraWeb PMS sisteminde otomatik stok düşerek rezervasyonu oluşturur.
* `testConnection()`: Token ve API bağlantı sağlığını doğrular.

---

## 3. Ortam Değişkenleri (Environment Variables)

```env
ELEKTRA_API_BASE_URL=https://bookingapi.elektraweb.com
ELEKTRA_HOTEL_ID=37555
ELEKTRA_API_TOKEN=YOUR_ELEKTRA_API_TOKEN_HERE
ELEKTRA_USERNAME=
ELEKTRA_PASSWORD=
ELEKTRA_TOKEN_CACHE_TTL=86400
```

---

## 4. Ödeme Sonrası Rezervasyon Hata Kurtarma ve Retry Mekanizması

Ödeme başarılı oldu ancak ElektraWeb API geçici olarak yanıt vermedi veya zaman aşımına uğradıysa:

1. Kullanıcıya "Ödemeniz Başarısız Oldu" DEMEYİN. Ödeme alınmıştır.
2. Rezervasyon durumu: `PAYMENT_SUCCESS_RESERVATION_PENDING` ve `sync_status = 'SYNC_FAILED'` yapılır.
3. Backend Arka Plan Retry Motoru (Background Retry Engine) devreye girer:
   - 1. Deneme: Anında
   - 2. Deneme: 30 saniye sonra
   - 3. Deneme: 2 dakika sonra
   - 4. Deneme: 10 dakika sonra
4. Admin paneli endpoint'i üzerinden (`POST /api/admin/reservations/:id/retry-sync`) manuel tek tıkla senkronizasyon tetiklenebilir.
