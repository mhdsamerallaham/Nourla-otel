# NOURLA BOUTIQUE HOTEL - DEPLOYMENT VE CANLIYA ALMA REHBERİ

## 1. Ortamlar (Environments)

Sistem 3 temel ortamı destekler:

1. **Development (Geliştirme):**
   - `PAYMENT_PROVIDER=mock`
   - `NODE_ENV=development`
2. **Staging (Test / Ön Canlı):**
   - `PAYMENT_PROVIDER=mock`
   - `ZIRAAT_ENVIRONMENT=test`
3. **Production (Canlı):**
   - `PAYMENT_PROVIDER=ziraat`
   - `ZIRAAT_ENVIRONMENT=production`
   - Real Ziraat Merchant ID, Terminal ID, Client ID ve Store Key tanımlı.

---

## 2. Sunucu Kurulum Adımları

### 1. Backend Servisi Başlatma
```bash
cd server
npm install
npm run start
```

### 2. Frontend Derleme ve Dağıtım
```bash
npm install
npm run build
```
Derlenen `dist` klasörü Nginx, Caddy veya Vercel/Netlify sunucusuna dağıtılabilir.

---

## 3. Ziraat Bankası Canlıya Geçiş Listesi

- [ ] Ziraat Bankası Mağaza Numarası (`ZIRAAT_MERCHANT_ID`) girildi.
- [ ] Ziraat Bankası Terminal Numarası (`ZIRAAT_TERMINAL_ID`) girildi.
- [ ] Ziraat 3D Store Key (`ZIRAAT_STORE_KEY`) girildi.
- [ ] `PAYMENT_PROVIDER=ziraat` ayarlandı.
- [ ] HTTPS SSL Sertifikası aktif edildi.
- [ ] Sunucuda log seviyesi (PCI-DSS uyarınca debug loglar kapalı) kontrol edildi.
