import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, Wine, Compass } from 'lucide-react';

const STORIES = [
  {
    icon: Wine,
    tag: 'VİNYARD EXPERIENCE',
    title: 'Urla Bağlarında Şarap Tadımı',
    excerpt:
      "Sommelierimiz eşliğinde antik bağları keşfedin, nadir üretim şarapları tadın. Bir öğleden sonra, ömür boyu süren bir hafıza.",
    stat: '6 bağ turu',
    statLabel: 'her sezon',
    color: 'bg-[#F7F4EE]',
    accent: '#6F7255',
  },
  {
    icon: Leaf,
    tag: 'FARM-TO-TABLE',
    title: 'Organik Bahçe Kahvaltısı',
    excerpt:
      "Her sabah taze toplanan zeytinler, domates ve otlarla hazırlanan kahvaltı. Misafirlerimizin %94'ü favorisi olarak seçiyor.",
    stat: '100%',
    statLabel: 'organik & yerel',
    color: 'bg-emerald-50',
    accent: '#059669',
  },
  {
    icon: Compass,
    tag: 'AEGEAN ESCAPE',
    title: 'Özel Tekne & Çeşme Günü',
    excerpt:
      "Çeşme'nin turkuaz koylarına özel tekne gezileri. Kristal sularda yüzme ve gün batımı eşliğinde dönüş.",
    stat: '35 km',
    statLabel: "Çeşme'ye uzaklık",
    color: 'bg-sky-50',
    accent: '#0284c7',
  },
];

export default function GuestStories() {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || 'tr';

  return (
    <section
      className="py-12 sm:py-20 bg-[#FDFBF7] relative z-10"
      aria-label="Misafir hikayeleri ve deneyimler"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-7 sm:mb-12 px-4">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-2">
            MİSAFİR HİKAYELERİ
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#2B2B2B] leading-tight">
            Nourla'da Yaşanan Anlar
          </h2>
          <p className="text-xs sm:text-sm text-[#555555] font-light mt-2 max-w-md mx-auto leading-relaxed px-4">
            Her konaklama benzersizdir. İşte misafirlerimizin en çok paylaştığı unutulmaz deneyimler.
          </p>
        </div>

        {/* ── MOBILE: horizontal scroll strip ─────────────────── */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-5 px-4 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STORIES.map((story, idx) => {
            const Icon = story.icon;
            return (
              <article
                key={idx}
                className={`snap-start shrink-0 w-[82vw] max-w-[320px] ${story.color} border border-[#E7E1D3] rounded-2xl p-5 flex flex-col gap-3`}
              >
                {/* Icon + tag */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${story.accent}15`, color: story.accent }}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: story.accent }}>
                    {story.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-[17px] text-[#2B2B2B] leading-snug">{story.title}</h3>

                {/* Excerpt */}
                <p className="text-xs text-[#555555] font-light leading-relaxed flex-1">{story.excerpt}</p>

                {/* Stat */}
                <div className="pt-3 border-t border-[#E7E1D3] flex items-center justify-between">
                  <div>
                    <span className="block font-serif text-xl font-semibold" style={{ color: story.accent }}>
                      {story.stat}
                    </span>
                    <span className="text-[10px] text-[#555555]">{story.statLabel}</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                    style={{ borderColor: `${story.accent}40`, color: story.accent }}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </article>
            );
          })}
          {/* Spacer so last card isn't flush against edge */}
          <div className="shrink-0 w-4" aria-hidden />
        </div>

        {/* Scroll hint dots — mobile only */}
        <div className="flex items-center justify-center gap-1.5 mb-6 md:hidden">
          {STORIES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === 0 ? 'w-5 h-1.5 bg-[#6F7255]' : 'w-1.5 h-1.5 bg-[#D5CEBE]'
              }`}
            />
          ))}
        </div>

        {/* ── DESKTOP: 3-col grid ───────────────────────────────── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 px-6 lg:px-8">
          {STORIES.map((story, idx) => {
            const Icon = story.icon;
            return (
              <article
                key={idx}
                className={`${story.color} border border-[#E7E1D3] rounded-2xl p-7 flex flex-col gap-4 hover:border-[#6F7255]/50 hover:shadow-lg transition-all group`}
              >
                {/* Icon + tag */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                    style={{ background: `${story.accent}15`, color: story.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: story.accent }}>
                    {story.tag}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#2B2B2B] leading-snug">{story.title}</h3>

                <p className="text-sm text-[#555555] font-light leading-relaxed flex-1">{story.excerpt}</p>

                <div className="pt-4 border-t border-[#E7E1D3] flex items-center justify-between">
                  <div>
                    <span className="block font-serif text-2xl font-medium" style={{ color: story.accent }}>
                      {story.stat}
                    </span>
                    <span className="text-[10px] text-[#555555] font-light">{story.statLabel}</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border flex items-center justify-center group-hover:text-white transition-all"
                    style={{ borderColor: `${story.accent}40`, color: story.accent }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center px-4">
          <Link
            to={`/${currentLang}/reservation`}
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-[#6F7255] hover:bg-[#4F523A] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-95"
            aria-label="Nourla Boutique Hotel rezervasyon sayfasına git"
          >
            Kendi Hikayenizi Yazın
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
