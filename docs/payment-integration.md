# NOURLA BOUTIQUE HOTEL - ÖDEME SİSTEMİ MİMARİSİ VE ENTEGRASYON DOKÜMANI

## 1. Genel Mimarisi

Sistemin ödeme yapısı **Provider-Agnostic Payment Gateway Abstraction** mimarisine sahiptir.
Frontend tarafında banka veya sağlayıcıya özel hiçbir teknik bilgi bulunmaz. Tüm kart doğrulama, 3D Secure yönlendirmesi, tutar doğrulama ve PMS senkronizasyonu backend tarafından yönetilir.

```
USER / FRONTEND
      │ (Oda & Tarih Seçimi)
      ▼
OUR BACKEND API (/api/booking/reservation)
      │ 1. ElektraWeb PMS'ten Canlı Fiyat/Müsaitlik Doğrula
      │ 2. Immutable Reservation Snapshot Oluştur (DB)
      ▼
OUR BACKEND API (/api/payment/create)
      │ 3. Client Amount Yerine DB Snapshot Tutarını Oku
      │ 4. Active Payment Gateway Instance Çağır (Mock / Ziraat)
      ▼
PAYMENT GATEWAY (Mock Gateway veya Ziraat Sanal POS)
      │ 5. 3D Secure Yönlendirmesi / Doğrulaması
      ▼
PAYMENT CALLBACK (/api/payment/callback)
      │ 6. Hash / Signature Doğrula
      │ 7. Payment Record = SUCCESS
      │ 8. ElektraWeb PMS Senkronizasyonu (createReservation)
      ▼
RESERVATION CONFIRMED / RETRY ENGINE
```

---

## 2. Desteklenen Ödeme Durumları (Payment Statuses)

| Status | Açıklama |
| :--- | :--- |
| `PENDING` | Ödeme işlemi başlatıldı, kullanıcı ödeme sayfasında. |
| `INITIATED` | Banka / Gateway oturumu oluşturuldu. |
| `REQUIRES_ACTION` | 3D Secure SMS şifre doğrulaması bekleniyor. |
| `PROCESSING` | Banka tarafında işlem işleniyor. |
| `SUCCESS` | Ödeme başarıyla tahsil edildi. |
| `FAILED` | Kart reddedildi veya 3D doğrulaması başarısız. |
| `CANCELLED` | İşlem kullanıcı veya sistem tarafından iptal edildi. |
| `REFUNDED` | Tutarın tamamı iade edildi. |
| `PARTIALLY_REFUNDED` | Tutarın bir kısmı iade edildi. |

---

## 3. Ziraat Bankası Sanal POS Canlıya Geçiş Rehberi

Ziraat Bankası yetkililerinden gerekli bilgiler alındığında canlıya geçmek için izlenecek adımlar:

### Adım 1: Environment Variables Doldurulması
`server/.env` dosyasındaki ödeme sağlayıcısını `ziraat` olarak değiştirin ve banka bilgilerini girin:

```env
PAYMENT_PROVIDER=ziraat
PAYMENT_HASH_SECRET=prod_nourla_secret_key_99

ZIRAAT_MERCHANT_ID=1000200030
ZIRAAT_TERMINAL_ID=ZIR12345
ZIRAAT_CLIENT_ID=600900123
ZIRAAT_USERNAME=nourla_vpos_user
ZIRAAT_PASSWORD=ZiraatPassword123!
ZIRAAT_STORE_KEY=Ziraat3dStoreKey_2026
ZIRAAT_ENVIRONMENT=production
ZIRAAT_API_URL=https://sanalpos2.ziraatbank.com.tr/fim/api
ZIRAAT_GATEWAY_URL=https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate
```

### Adım 2: Gateway Katmanı
`server/services/payment/index.js` içerisindeki `getPaymentGateway()` fonksiyonu `PAYMENT_PROVIDER=ziraat` yapıldığında otomatik olarak `ZiraatPaymentGateway` sınıfını aktifleştirecektir. Frontend tarafında hiçbir kod değişikliği gerekmez.

---

## 4. Güvenlik ve PCI-DSS Kuralları

1. **Kart Numaraları:** Gerçek kart numaraları ve CVV kodları veritabanına KESİNLİKLE KAYDEDİLMEZ. Log dosyalarında gizlenir (Maskelenir: `**** **** **** 4242`).
2. **Client Amount Protection:** Frontend'den gelen `total_price` veya `amount` parametrelerine güvenilmez. Ödeme tutarı veritabanındaki Immutable Reservation Snapshot kaydından çekilir.
3. **Idempotency & Replay Protection:** Aynı ödeme isteği veya callback iki kez gelirse duplicate çekim veya duplicate rezervasyon engellenir.
