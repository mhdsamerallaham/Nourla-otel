import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function About() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag={t('nav.about')}
          title={t('intro.title')}
          subtitle={t('hero.subtitle')}
        />

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (5).jpeg"
              alt="Restored Heritage Stone Structure"
              className="w-full h-auto rounded-lg shadow-xl object-cover aspect-[4/3]"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-serif text-3xl text-[#2B2B2B]">
              Hikayemiz & Restorasyon Mirasımız
            </h3>
            <p className="text-sm text-[#555555] leading-relaxed font-light">
              Nourla Boutique Hotel, Urla'nın tarihi dokusunu koruyarak 150 yıllıkRum konaklarının ve taş işçiliğinin aslına sadık kalınarak restore edilmesiyle kurulmuştur. Kadim zeytin ağaçları arasında yükselen otelimiz, doğanın ritmine saygı duyan bir mimari anlayışı temsil eder.
            </p>
            <p className="text-sm text-[#555555] leading-relaxed font-light">
              Geleneksel Ege taş mimarisini çağdaş minimalizm ve rafine detaylarla buluşturarak misafirlerimize ev sıcaklığında bir lüks sunuyoruz.
            </p>
          </div>
        </div>

        {/* Boutique Positioning Grid (10 Exclusive Suites) */}
        <div className="bg-[#F7F4EE] rounded-3xl p-8 md:p-14 border border-[#E7E1D3] mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase">
              BUTİK KONUMLANDIRMA
            </span>
            <h3 className="font-serif text-3xl text-[#2B2B2B] mt-2">
              Sadece 10 Özel Süit ile Maksimum Mahremiyet
            </h3>
            <p className="text-xs text-[#555555] mt-2 font-light">
              Kitle turizminden uzak, kişiselleştirilmiş ve sakin konaklama felsefesi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#E7E1D3]">
              <ShieldCheck className="w-8 h-8 text-[#6F7255] mb-4" />
              <h4 className="font-serif text-xl text-[#2B2B2B] mb-2">Ayrıcalıklı Mahremiyet</h4>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                Her odamız bağımsız havalandırmaya, özel verandaya ve doğayla doğrudan temasa sahiptir.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#E7E1D3]">
              <Sparkles className="w-8 h-8 text-[#6F7255] mb-4" />
              <h4 className="font-serif text-xl text-[#2B2B2B] mb-2">Bespoke Servis</h4>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                Kişiye özel kahvaltı saatleri, sommelier rehberliği ve özel transfer konforu.
              </p>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-[#E7E1D3]">
              <Heart className="w-8 h-8 text-[#6F7255] mb-4" />
              <h4 className="font-serif text-xl text-[#2B2B2B] mb-2">Doğa ile Uyum</h4>
              <p className="text-xs text-[#555555] leading-relaxed font-light">
                Zeytin bahçelerimiz ve organik seramız ile sürdürülebilir yaşam tarzı.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
