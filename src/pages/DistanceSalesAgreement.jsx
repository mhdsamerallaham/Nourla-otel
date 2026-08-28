import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileCheck2, ArrowLeft, Scale, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DistanceSalesAgreement() {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          to={`/${currentLang}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F7255] hover:text-[#4F523A] mb-8 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        {/* Header Banner */}
        <div className="bg-white border border-[#E7E1D3] rounded-3xl p-6 sm:p-10 shadow-xs mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block">
                Nourla Boutique Hotel
              </span>
              <span className="text-xs text-[#555555]">6502 Sayılı Tüketicinin Korunması Hakkında Kanun Uyarınca</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mb-3">
            Mesafeli Satış Sözleşmesi ve İptal/İade Koşulları
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] font-light leading-relaxed">
            İşbu sözleşme, web sitemiz (www.nourla.com.tr) üzerinden elektronik ortamda gerçekleştirilen otel rezervasyonu, konaklama ve bağlantılı hizmetlerin satışına ilişkin hak ve yükümlülükleri düzenler.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-[#E7E1D3] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-[#2B2B2B]">

          <Section title="MADDE 1 – TARAFLAR">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#555555]">
              <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] space-y-1.5">
                <h3 className="font-semibold text-[#2B2B2B] text-sm mb-2">1.1. SATICI (Hizmet Sağlayıcı):</h3>
                <p><strong>Unvan:</strong> NOURLA TURİZM OTELCİLİK A.Ş.</p>
                <p><strong>Adres:</strong> İskele Mahallesi 2222/5 Sokak No: 4/1, Urla / İzmir</p>
                <p><strong>Telefon:</strong> +90 232 754 00 00 / +90 532 365 38 62</p>
                <p><strong>E-posta:</strong> info@nourla.com.tr</p>
                <p><strong>Web:</strong> www.nourla.com.tr</p>
              </div>

              <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] space-y-1.5">
                <h3 className="font-semibold text-[#2B2B2B] text-sm mb-2">1.2. ALICI (Tüketici / Misafir):</h3>
                <p>Web sitemiz üzerinden rezervasyon oluşturan, misafir ve iletişim bilgilerini giren, konaklama ücretini ödemeyi taahhüt eden gerçek veya tüzel kişidir.</p>
                <p className="text-[11px] text-[#6F7255] italic pt-1">Rezervasyon adımlarında beyan edilen ad, soyad, telefon ve e-posta bilgileri esas alınır.</p>
              </div>
            </div>
          </Section>

          <Section title="MADDE 2 – SÖZLEŞMENİN KONUSU">
            <p>
              İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.nourla.com.tr internet sitesi üzerinden elektronik ortamda rezervasyonunu yaptığı, nitelikleri, oda tipi, giriş-çıkış tarihleri ve konaklama satış fiyatı sitede belirtilen otel konaklama hizmetinin satışı ve ifası ile ilgili olarak 6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </Section>

          <Section title="MADDE 3 – HİZMET BİLGİLERİ VE ÖDEME KOŞULLARI">
            <ul className="list-disc pl-5 space-y-2 text-[#555555] font-light text-xs sm:text-sm">
              <li><strong>Hizmet Detayları:</strong> Konaklama yapılacak oda tipi (Standart, Taş Oda, Süit vb.), pansiyon durumu (Kahvaltılı veya Kahvaltısız), konaklama süresi (gece sayısı) ve misafir sayısı rezervasyon özetinde belirtildiği gibidir.</li>
              <li><strong>Fiyatlandırma:</strong> Web sitemizde gösterilen tüm fiyatlara ilgili yasal vergiler (%10 KDV ve Konaklama Vergisi) dahildir.</li>
              <li><strong>Ödeme Yöntemleri:</strong> Ödemeler, anlaşmalı banka hesabımıza <strong>Banka Havalesi / EFT</strong> yoluyla veya güvenli <strong>Kredi Kartı / Banka Kartı</strong> altyapısı ile gerçekleştirilir.</li>
              <li><strong>Havale/EFT ile Ödemeler:</strong> Banka havalesi seçildiğinde, ALICI'nın rezervasyon kodunu açıklama kısmına yazarak rezervasyon tarihinden itibaren 1 iş günü içerisinde ödemeyi gerçekleştirmesi gerekmektedir.</li>
            </ul>
          </Section>

          <Section title="MADDE 4 – GİRİŞ (CHECK-IN) VE ÇIKIŞ (CHECK-OUT) KURALLARI">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#E7E1D3] space-y-1">
                <span className="font-semibold text-xs text-[#6F7255] uppercase block">Giriş Saati (Check-in)</span>
                <p className="font-serif text-lg text-[#2B2B2B] font-bold">14:00 ve sonrası</p>
                <p className="text-xs text-[#555555]">Otele girişte tüm misafirlerin yasal kimlik/pasaport ibraz etmesi zorunludur.</p>
              </div>

              <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#E7E1D3] space-y-1">
                <span className="font-semibold text-xs text-[#6F7255] uppercase block">Çıkış Saati (Check-out)</span>
                <p className="font-serif text-lg text-[#2B2B2B] font-bold">En geç 12:00</p>
                <p className="text-xs text-[#555555]">Geç çıkış talepleri otelin o günkü müsaitlik durumuna ve ücrete tabi olabilir.</p>
              </div>
            </div>
          </Section>

          <Section title="MADDE 5 – İPTAL, DEĞİŞİKLİK VE İADE KOŞULLARI">
            <div className="space-y-3 text-xs sm:text-sm text-[#555555] font-light">
              <p>
                <strong>5.1. İade Edilebilir (Flexible / Standart) Rezervasyonlar:</strong> Giriş tarihine <strong>3 gün (72 saat)</strong> kalana kadar yapılan iptallerde konaklama ücreti ALICI'ya kesintisiz olarak iade edilir. Giriş tarihine 72 saatten az süre kala yapılan iptallerde veya otele gelinmemesi (No-Show) durumunda konaklama tutarının tamamı tahsil edilir ve iade yapılmaz.
              </p>
              <p>
                <strong>5.2. İadesiz (Non-Refundable / Erken Rezervasyon) Fiyatlar:</strong> Özel promosyonlu, erken rezervasyon indirimli ve iadesiz fiyat kategorilerinde yapılan rezervasyonlarda iptal, değişiklik veya ücret iadesi yapılmamaktadır.
              </p>
              <p>
                <strong>5.3. Mücbir Sebepler:</strong> Doğal afet, salgın hastalık, resmi seyahat kısıtlamaları veya birinci derece vefat gibi belgelenebilir mücbir sebep hallerinde rezervasyon tarih değişikliği veya iade talepleri otel yönetimi tarafından iyi niyet çerçevesinde değerlendirilir.
              </p>
              <p>
                <strong>5.4. İade Süreci:</strong> Onaylanan iadeler, ödemenin yapıldığı banka hesabına veya kredi kartına 7-14 iş günü içerisinde aktarılır.
              </p>
            </div>
          </Section>

          <Section title="MADDE 6 – CAYMA HAKKININ İSTİSNASI">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Mesafeli Sözleşmeler Yönetmeliği Madde 15/1-g Uyarınca:</strong>
                  <p className="mt-1 leading-relaxed">
                    <em>"Belirli bir tarihte veya dönemde yapılması gereken, konaklama, eşya taşıma, araba kiralama, yiyecek-içecek tedariki ve eğlence veya dinlenme amacıyla yapılan boş zamanın değerlendirilmesine ilişkin sözleşmelerde"</em> <strong>tüketicinin 14 günlük cayma hakkı bulunmamaktadır.</strong> İptal ve iade süreçlerinde işbu sözleşmenin 5. maddesinde yer alan otel iptal koşulları geçerlidir.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="MADDE 7 – GENEL HÜKÜMLER VE OTEL KURALLARI">
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light text-xs sm:text-sm">
              <li>Otel genelinde ve odalarda huzuru bozucu davranışlar yasaktır.</li>
              <li>Oda içerisinde tütün ve tütün mamulleri kullanımı kanun gereği yasaktır.</li>
              <li>Evcil hayvan kabulü ve ek yatak talepleri rezervasyon öncesinde otel onayına tabidir.</li>
              <li>Otel eşyalarına verilen kasıtlı hasarlar ALICI'dan tazmin edilir.</li>
            </ul>
          </Section>

          <Section title="MADDE 8 – UYUŞMAZLIKLARIN ÇÖZÜMÜ">
            <p>
              İşbu sözleşmenin uygulanmasından doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı’nca her yıl ilan edilen parasal sınırlar dahilinde ALICI’nın yerleşim yerindeki veya SATICI’nın bulunduğu yerdeki (İzmir) <strong>İl/İlçe Tüketici Hakem Heyetleri</strong> ile <strong>Tüketici Mahkemeleri</strong> yetkilidir.
            </p>
          </Section>

          <Section title="MADDE 9 – YÜRÜRLÜK">
            <p>
              ALICI, web sitesi üzerinden rezervasyon adımlarını tamamlayıp <em>"Mesafeli Satış Sözleşmesi ve İptal/İade Koşullarını kabul ediyorum"</em> kutucuğunu işaretlediğinde, işbu sözleşmenin tüm maddelerini okumuş, anlamış ve kabul etmiş sayılır.
            </p>
          </Section>

          <div className="pt-6 border-t border-[#E7E1D3] text-xs text-[#555555] font-light flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© {new Date().getFullYear()} Nourla Turizm Otelcilik A.Ş.</span>
            <span>Tüm Hakları Saklıdır</span>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl sm:text-2xl text-[#2B2B2B] flex items-center gap-2">
        <Scale className="w-5 h-5 text-[#6F7255] shrink-0" />
        {title}
      </h2>
      <div className="text-xs sm:text-sm text-[#555555] font-light leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
