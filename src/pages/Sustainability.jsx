import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Sun, HeartHandshake, Users, CheckCircle2, Award, Sparkles, ShieldCheck } from 'lucide-react';

import SectionHeader from '../components/ui/SectionHeader';
import MediaPlaceholder from '../components/ui/MediaPlaceholder';
import { SUSTAINABILITY_SECTIONS, SUSTAINABILITY_METRICS, SURVEY_QUESTIONS } from '../data/sustainability';

const ICON_MAP = {
  Leaf,
  Sun,
  HeartHandshake,
  Users
};

export default function Sustainability() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'tr';

  // Survey UI State
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const handleOptionSelect = (questionId, score) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateTotalScore = () => {
    return Object.values(surveyAnswers).reduce((acc, curr) => acc + curr, 0);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. WARM MEDITERRANEAN HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden mb-16 border border-[#E7E1D3] shadow-xl">
          <div className="relative h-[320px] sm:h-[380px] w-full">
            <img
              src="/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (7).jpeg"
              alt="Nourla Eco Sanctuary"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2B2B2B]/90 via-[#2B2B2B]/60 to-transparent flex items-center p-8 sm:p-14">
              <div className="max-w-xl text-white space-y-3">
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase bg-[#6F7255]/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-block text-[#E7E1D3]">
                  {t('sustainability.hero_tag')}
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight">
                  {t('sustainability.hero_title')}
                </h1>
                <p className="text-xs sm:text-sm text-[#E7E1D3]/90 font-light leading-relaxed">
                  {t('sustainability.hero_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. LUXURY ECO-METRICS COUNTER CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24">
          {SUSTAINABILITY_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="bg-[#F7F4EE] p-6 rounded-2xl border border-[#E7E1D3] text-center hover:border-[#6F7255]/40 transition-all shadow-xs"
            >
              <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#6F7255] block mb-1">
                {metric.value}
              </span>
              <span className="text-xs font-semibold text-[#2B2B2B] block uppercase tracking-wider mb-1">
                {metric.label[currentLang] || metric.label.tr}
              </span>
              <span className="text-[11px] text-[#555555] font-light block">
                {metric.desc[currentLang] || metric.desc.tr}
              </span>
            </div>
          ))}
        </div>

        {/* 3. CONTINUOUS SINGLE-PAGE EDITORIAL POLICY SHOWCASE (4 SECTIONS LISTED CONTINUOUSLY) */}
        <div className="space-y-20 mb-24">
          {SUSTAINABILITY_SECTIONS.map((sec, idx) => {
            const isEven = idx % 2 === 0;
            const Icon = ICON_MAP[sec.icon] || Leaf;
            const title = sec.title[currentLang] || sec.title.tr;
            const subtitle = sec.subtitle[currentLang] || sec.subtitle.tr;
            const content = sec.content[currentLang] || sec.content.tr;

            return (
              <div
                key={sec.id}
                className="bg-[#F7F4EE]/60 rounded-3xl p-8 sm:p-12 border border-[#E7E1D3] shadow-lg transition-all"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  {/* Photo Showcase */}
                  <div className={`lg:col-span-5 ${isEven ? '' : 'lg:order-2'}`}>
                    <MediaPlaceholder
                      type="image"
                      imageUrl={sec.image}
                      title={title}
                      aspectRatio="aspect-[4/3]"
                      className="shadow-xl"
                    />
                  </div>

                  {/* Policy Text & Details */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? '' : 'lg:order-1'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center border border-[#6F7255]/20 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block">
                          {t('sustainability.policy_label')} 0{idx + 1}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2B2B]">
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

                    <div className="pt-4 border-t border-[#E7E1D3] flex items-center gap-3">
                      <Award className="w-5 h-5 text-[#6F7255] shrink-0" />
                      <span className="text-xs text-[#2B2B2B] font-medium">
                        Nourla Boutique Hotel — Certified Sustainable Eco-Luxury Policy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. EMBEDDED GUEST SUSTAINABILITY SURVEY SECTION */}
        <div id="survey" className="bg-[#FDFBF7] rounded-3xl p-8 sm:p-12 border border-[#E7E1D3] shadow-xl max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-1">
              {t('sustainability.survey_tag')}
            </span>
            <h2 className="font-serif text-3xl text-[#2B2B2B]">{t('sustainability.survey')}</h2>
            <p className="text-xs text-[#555555] mt-1 font-light max-w-md mx-auto">
              {t('sustainability.survey_desc')}
            </p>
          </div>

          {!surveySubmitted ? (
            <div className="space-y-8">
              {SURVEY_QUESTIONS.map((q) => (
                <div key={q.id} className="p-6 rounded-2xl bg-[#F7F4EE] border border-[#E7E1D3]">
                  <h4 className="font-serif text-base text-[#2B2B2B] mb-4 font-medium">
                    {q.id}. {q.question[currentLang] || q.question.tr}
                  </h4>
                  <div className="space-y-2.5">
                    {q.options.map((opt, idx) => {
                      const isSelected = surveyAnswers[q.id] === opt.score;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionSelect(q.id, opt.score)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#6F7255] bg-[#6F7255] text-white font-medium shadow-sm'
                              : 'border-[#E7E1D3] bg-[#FDFBF7] text-[#2B2B2B] hover:border-[#6F7255]'
                          }`}
                        >
                          <span>{opt.text[currentLang] || opt.text.tr}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setSurveySubmitted(true)}
                disabled={Object.keys(surveyAnswers).length < SURVEY_QUESTIONS.length}
                className="w-full py-4 px-6 rounded-full bg-[#6F7255] hover:bg-[#4F523A] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md"
              >
                {t('sustainability.see_score_btn')}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-[#6F7255]/10 text-[#6F7255] flex items-center justify-center mx-auto mb-6 border border-[#6F7255] shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-3xl text-[#2B2B2B] mb-2">{t('sustainability.congrats')}</h3>
              <p className="text-xs text-[#555555] max-w-sm mx-auto mb-8 font-light leading-relaxed">
                {t('sustainability.congrats_desc')}
              </p>

              {/* Digital Eco-Certificate Badge */}
              <div className="bg-[#2B2B2B] text-white p-8 rounded-3xl border border-[#4F523A] shadow-2xl max-w-sm mx-auto mb-8 relative overflow-hidden">
                <div className="text-[10px] tracking-[0.25em] text-[#E7E1D3]/70 font-semibold uppercase block mb-1">
                  {t('sustainability.eco_cert_tag')}
                </div>
                <div className="font-serif text-4xl font-semibold text-[#E7E1D3] my-2">
                  {calculateTotalScore()} / 45
                </div>
                <span className="text-xs text-[#6F7255] bg-[#E7E1D3] px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-block">
                  {t('sustainability.eco_badge')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setSurveySubmitted(false); setSurveyAnswers({}); }}
                className="px-6 py-2.5 rounded-full bg-[#6F7255] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4F523A] transition-all"
              >
                {t('sustainability.restart_btn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
