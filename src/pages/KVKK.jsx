import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export default function KVKK() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block">
                Nourla Boutique Hotel & Rezervasyon
              </span>
              <span className="text-xs text-[#555555]">6698 Sayılı Kanun Kapsamında Bilgilendirme</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B2B2B] mb-3">
            KVKK Aydınlatma ve Açık Rıza Metni
          </h1>
          <p className="text-xs sm:text-sm text-[#555555] font-light leading-relaxed">
            Nourla Turizm Otelcilik A.Ş. olarak, misafirlerimizin ve web sitesi ziyaretçilerimizin kişisel verilerinin güvenliğine ve gizliliğine en üst düzeyde önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu sıfatıyla verilerinizi nasıl işlediğimizi aşağıda bilgilerinize sunarız.
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-[#E7E1D3] rounded-3xl p-6 sm:p-10 shadow-xs space-y-10 text-[#2B2B2B]">

          <Section title="1. Veri Sorumlusunun Kimliği">
            <p>
              6698 sayılı KVKK uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>Nourla Turizm Otelcilik A.Ş.</strong> (“Nourla Boutique Hotel” veya “Şirket”) tarafından aşağıda açıklanan kapsamda işlenmektedir.
            </p>
            <div className="bg-[#F7F4EE] p-4 rounded-2xl border border-[#E7E1D3] text-xs space-y-1 text-[#555555]">
              <p><strong>Unvan:</strong> NOURLA TURİZM OTELCİLİK A.Ş.</p>
              <p><strong>Adres:</strong> İskele Mahallesi 2222/5 Sokak No: 4/1, Urla / İzmir</p>
              <p><strong>Telefon:</strong> +90 232 754 00 00 / +90 532 365 38 62</p>
              <p><strong>E-posta:</strong> info@nourla.com.tr</p>
            </div>
          </Section>

          <Section title="2. İşlenen Kişisel Verileriniz">
            <p>Konaklama, rezervasyon ve web sitemizi kullanımınız sırasında aşağıdaki kategorilerde kişisel verileriniz işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#555555] font-light text-xs sm:text-sm">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (veya yabancı misafirler için pasaport numarası), doğum tarihi, uyruk.</li>
              <li><strong>İletişim Bilgileri:</strong> Telefon numarası, e-posta adresi, fatura ve ikametgah adresi.</li>
              <li><strong>Rezervasyon ve Konaklama Bilgileri:</strong> Giriş-çıkış tarihleri, oda tipi tercihi, beraberindeki misafir bilgileri, özel konaklama notları.</li>
              <li><strong>Finansal Bilgiler:</strong> Ödeme yöntemi, fatura bilgileri, banka havalesi dekont/işlem bilgileri (Kredi kartı numaraları hiçbir şekilde sistemlerimizde tutulmamakta, doğrudan BDDK lisanslı banka/ödeme altyapısında şifrelenmektedir).</li>
              <li><strong>Dijital ve Ağ Güvenliği Bilgileri:</strong> IP adresi, internet sitesi giriş-çıkış kayıtları, çerez (cookie) verileri.</li>
            </ul>
          </Section>

          <Section title="3. Kişisel Verilerin İşlenme Amaçları">
            <p>Kişisel verileriniz aşağıdaki amaçlarla KVKK’nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak işlenmektedir:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Otel rezervasyon ve konaklama sözleşmesinin ifası',
                'Kimlik Bildirme Kanunu (1774 Sayılı Kanun) gereği Emniyet/KBS sistemine bildirim yapılması',
                'Muhasebe, faturalama ve finansal süreçlerin yürütülmesi',
                'Misafir talep, öneri ve özel isteklerinin karşılanması',
                'Bilgi ve işlem güvenliğinin temin edilmesi',
                'Açık rızanız olması durumunda özel kampanya ve bülten iletimi',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F4EE] border border-[#E7E1D3] text-xs text-[#555555]">
                  <CheckCircle2 className="w-4 h-4 text-[#6F7255] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="4. Kişisel Verilerin Aktarılması">
            <p>
              Toplanan kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda ve mevzuatın izin verdiği ölçüde:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light text-xs sm:text-sm">
              <li>1774 Sayılı Kimlik Bildirme Kanunu uyarınca Emniyet Genel Müdürlüğü / Jandarma Genel Komutanlığı KBS sistemine,</li>
              <li>Vergi ve mali mevzuat gereği Gelir İdaresi Başkanlığı ve yetkili kamu kurumlarına,</li>
              <li>Ödemelerin tahsili amacıyla anlaşmalı bankalar ve lisanslı ödeme kuruluşlarına,</li>
              <li>Hukuki yükümlülüklerin ifası için yetkili adli ve idari mercilere aktarılabilmektedir.</li>
            </ul>
          </Section>

          <Section title="5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi">
            <p>
              Kişisel verileriniz; web sitemiz (www.nourla.com.tr), online rezervasyon motoru, çağrı merkezi, e-posta, fiziksel resepsiyon kayıt formu ve sözlü iletişim kanalları aracılığıyla elektronik ve fiziki ortamlarda toplanmaktadır.
            </p>
            <p className="mt-2">
              Bu süreçte verileriniz, KVKK Madde 5/2 uyarınca <em>“Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması”</em>, <em>“Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi”</em> ve <em>“Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz için veri işlenmesinin zorunlu olması”</em> hukuki sebeplerine dayalı olarak işlenmektedir.
            </p>
          </Section>

          <Section title="6. İlgili Kişinin Hakları (KVKK Madde 11)">
            <p>KVKK'nın 11. maddesi uyarınca veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#555555] font-light text-xs sm:text-sm">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
              <li>KVKK 7. maddede öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
            </ul>
          </Section>

          <Section title="7. Başvuru ve İletişim">
            <p>
              Haklarınızı kullanmak için kimliğinizi tevsik edici belgeler ile birlikte yazılı başvurunuzu <strong>İskele Mahallesi 2222/5 Sokak No: 4/1, Urla / İzmir</strong> adresine ıslak imzalı olarak veya kayıtlı elektronik posta (KEP) / güvenli elektronik imza ile <strong>info@nourla.com.tr</strong> adresine iletebilirsiniz. Başvurunuz 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
            </p>
          </Section>

          <div className="pt-6 border-t border-[#E7E1D3] text-xs text-[#555555] font-light flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© {new Date().getFullYear()} Nourla Turizm Otelcilik A.Ş.</span>
            <span>Son Güncelleme: 2026</span>
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
        <FileText className="w-5 h-5 text-[#6F7255] shrink-0" />
        {title}
      </h2>
      <div className="text-xs sm:text-sm text-[#555555] font-light leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}
