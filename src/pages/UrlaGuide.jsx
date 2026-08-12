import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Compass, MapPin, Sparkles, Calendar, CheckCircle2, Wine, Utensils, Bike, Landmark, Sun, HeartHandshake } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';
import { URLA_TOPICS } from '../data/urlaGuide';

const ICON_MAP = {
  history: Landmark,
  beaches: Sun,
  culture: HeartHandshake,
  wine: Wine,
  gastronomy: Utensils,
  itinerary: Compass,
  cycling: Bike,
  festivals: Sparkles,
};

export default function UrlaGuide() {
  const { i18n, t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. LUXURY EXHIBITION HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden mb-16 border border-[#E7E1D3] shadow-xl">
          <div className="relative h-[340px] sm:h-[400px] w-full">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48.jpeg"
              alt="Urla Vineyard Hills"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/90 via-[#2B2B2B]/60 to-transparent flex items-center p-8 sm:p-14">
              <div className="max-w-2xl text-white space-y-4">
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase bg-[#6F7255]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 inline-block text-[#E7E1D3]">
                  BESPOKE URLA EXPERIENCE GUIDE
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                  Urla'nın Ruhunu & Kadim Mirasını Keşfedin
                </h1>
                <p className="text-xs sm:text-sm text-[#E7E1D3]/90 font-light leading-relaxed">
                  2600 yıllık Klazomenai zeytin mirasından Michelin yıldızlı fine dining restoranlara, antik bağ yollarından saklı Ege koylarına rafine bir keşif rehberi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. QUICK JUMP ANCHOR NAVIGATION BAR */}
        <div className="bg-[#F7F4EE] p-4 sm:p-6 rounded-2xl border border-[#E7E1D3] shadow-xs mb-16">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#6F7255] block mb-3 text-center sm:text-left">
            HIZLI KEŞİF BAŞLIKLARI
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {URLA_TOPICS.map((topic) => {
              const Icon = ICON_MAP[topic.id] || Compass;
              const title = topic.title[currentLang]?.split('&')[0] || topic.title.tr.split('&')[0];
              return (
                <a
                  key={topic.id}
                  href={`#${topic.slug}`}
                  className="px-3.5 py-2 rounded-xl bg-[#FDFBF7] border border-[#E7E1D3] text-xs font-semibold text-[#2B2B2B] hover:border-[#6F7255] hover:text-[#6F7255] transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Icon className="w-3.5 h-3.5 text-[#6F7255]" />
                  {title}
                </a>
              );
            })}
          </div>
        </div>

        {/* 3. CONTINUOUS EDITORIAL TOPIC SHOWCASE CARDS (8 TOPICS LISTED ELEGANTLY) */}
        <div className="space-y-16">
          {URLA_TOPICS.map((topic, idx) => {
            const isEven = idx % 2 === 0;
            const Icon = ICON_MAP[topic.id] || Compass;
            const title = topic.title[currentLang] || topic.title.tr;
            const subtitle = topic.subtitle[currentLang] || topic.subtitle.tr;
            const content = topic.content[currentLang] || topic.content.tr;

            return (
              <div
                key={topic.id}
                id={topic.slug}
                className="bg-[#FDFBF7] rounded-3xl p-8 sm:p-12 border border-[#E7E1D3] shadow-lg hover:border-[#6F7255]/30 transition-all scroll-mt-32"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${isEven ? '' : ''}`}>
                  {/* Photo Media Showcase */}
                  <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-2'}`}>
                    <MediaPlaceholder
                      type="image"
                      imageUrl={topic.image}
                      title={title}
                      aspectRatio="aspect-[4/3]"
                      className="shadow-xl"
                    />
                  </div>

                  {/* Topic Details & Highlights */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? '' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block">
                          {topic.categoryBadge || 'URLA EXPERIENCE'}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-4xl text-[#2B2B2B]">
                          {title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-[#6F7255] italic">
                      {subtitle}
                    </p>

                    <p className="text-sm text-[#555555] font-light leading-relaxed">
                      {content}
                    </p>

                    {/* Highlights Badges */}
                    {topic.highlights && (
                      <div className="pt-2 border-t border-[#E7E1D3]/80 space-y-2">
                        <span className="text-[11px] font-semibold text-[#2B2B2B] uppercase tracking-wider block">
                          Öne Çıkan Deneyimler:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {topic.highlights.map((hl, hIdx) => (
                            <span
                              key={hIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F4EE] border border-[#E7E1D3] text-xs font-medium text-[#2B2B2B]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#6F7255]" />
                              {hl[currentLang] || hl.tr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex items-center gap-4">
                      <Link
                        to={`/${currentLang}/reservation`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
                      >
                        <Calendar className="w-4 h-4" />
                        Concierge İle Keşfet
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
