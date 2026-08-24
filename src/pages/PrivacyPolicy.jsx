import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          to={`/${currentLang}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F7255] hover:text-[#4F523A] mb-10 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
              Nourla Boutique Hotel
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mb-3">
            Gizlilik Politikası
          </h1>
          <p className="text-xs text-[#555555] font-light">
            Son güncelleme: Ağustos 2026 — 6698 sayılı KVKK kapsamında hazırlanmıştır.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-8 text-[#2B2B2B]">

          <Section title="1. Veri Sorumlusu">
            <p>
              Bu gizlilik politikası, <strong>Nourla Boutique Hotel</strong> (bundan böyle "Nourla" veya "Otel" olarak anılacaktır)
              tarafından, İskele Mahallesi 2222/5 Sokak No: 4/1, Urla / İzmir adresinde faaliyet göstermekte olan
              konaklama işletmesi olarak hazırlanmıştır.
            </p>
            <p>İletişim: <a href="mailto:info@nourla.com.tr" className="text-[#6F7255] underline">info@nourla.com.tr</a></p>
          </Section>

          <Section title="2. Toplanan Veriler">
            <p>Nourla web sitesi ve rezervasyon sistemi aracılığıyla aşağıdaki kişisel veriler toplanmaktadır:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light">
              <li>Ad, soyad ve iletişim bilgileri (telefon, e-posta)</li>
              <li>Rezervasyon bilgileri (giriş/çıkış tarihi, oda tercihi, misafir sayısı)</li>
              <li>Ödeme bilgileri (yalnızca ödeme aracı kurumu üzerinden işlenir; kart bilgileri Nourla tarafından saklanmaz)</li>
              <li>IP adresi ve tarayıcı bilgileri (analitik amaçlı)</li>
              <li>İletişim formları aracılığıyla iletilen mesajlar</li>
            </ul>
          </Section>

          <Section title="3. Verilerin Kullanım Amacı">
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light">
              <li>Rezervasyon işlemlerinin tamamlanması ve onay bildirimleri</li>
              <li>Misafir talep ve şikayetlerinin yanıtlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, kamu güvenliği)</li>
              <li>Hizmet kalitesinin iyileştirilmesi (anonim analitik veriler)</li>
              <li>Açık onay verilmesi halinde tanıtım ve kampanya iletişimi</li>
            </ul>
          </Section>

          <Section title="4. Çerezler (Cookies)">
            <p>
              Web sitemiz, deneyiminizi geliştirmek için oturum çerezleri ve analitik çerezler kullanmaktadır.
              Zorunlu çerezler hariç diğer çerezleri tarayıcı ayarlarınızdan devre dışı bırakabilirsiniz.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light">
              <li><strong>Zorunlu çerezler:</strong> Rezervasyon oturumu ve dil tercihi</li>
              <li><strong>Analitik çerezler:</strong> Ziyaretçi sayısı ve sayfa analizi (Google Analytics)</li>
            </ul>
          </Section>

          <Section title="5. Veri Güvenliği">
            <p>
              Toplanan tüm kişisel veriler SSL/TLS şifreli bağlantılar üzerinden iletilmekte ve güvenli sunucularda
              saklanmaktadır. Ödeme işlemleri PCI-DSS uyumlu üçüncü taraf ödeme altyapısı üzerinden
              gerçekleştirilmekte olup kart bilgileri hiçbir şekilde Nourla sistemlerinde saklanmamaktadır.
            </p>
          </Section>

          <Section title="6. Üçüncü Taraflarla Paylaşım">
            <p>
              Kişisel verileriniz; yasal zorunluluklar, ödeme işlemcileri ve konaklama yönetim sistemi (PMS)
              entegrasyonu dışında herhangi bir üçüncü tarafla paylaşılmamaktadır.
            </p>
          </Section>

          <Section title="7. Haklarınız (KVKK Madde 11)">
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>Verilerin yanlış veya eksik işlenmiş olması halinde düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>Otomatik sistemler vasıtasıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            </ul>
            <p>
              Haklarınızı kullanmak için{' '}
              <a href="mailto:info@nourla.com.tr" className="text-[#6F7255] underline">
                info@nourla.com.tr
              </a>{' '}
              adresine yazılı başvuruda bulunabilirsiniz.
            </p>
          </Section>

          <Section title="8. Politika Değişiklikleri">
            <p>
              Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler web sitemizde
              duyurulacaktır. Politikanın en güncel halini bu sayfadan takip edebilirsiniz.
            </p>
          </Section>

          <div className="pt-8 border-t border-[#E7E1D3] text-xs text-[#555555] font-light">
            <p>© {new Date().getFullYear()} Nourla Boutique Hotel — Tüm hakları saklıdır.</p>
            <p className="mt-1">
              İletişim:{' '}
              <a href="mailto:info@nourla.com.tr" className="text-[#6F7255] underline">
                info@nourla.com.tr
              </a>{' '}
              | +90 232 754 00 00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl text-[#2B2B2B]">{title}</h2>
      <div className="space-y-2 text-sm text-[#555555] font-light leading-relaxed">
        {children}
      </div>
    </div>
  );
}
