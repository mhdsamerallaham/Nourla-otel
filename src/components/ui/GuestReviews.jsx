import React from 'react';
import { Star, MapPin, Quote } from 'lucide-react';
import StructuredData from './StructuredData';

const REVIEWS = [
  {
    id: 1,
    name: 'Sophie M.',
    country: 'France 🇫🇷',
    rating: 10,
    date: '2026-07',
    title: 'A sanctuary beyond words',
    text: 'Waking up to the scent of olive trees and Aegean breeze was unlike anything I\'ve experienced. The suite was impeccably designed — every detail felt intentional. The farm breakfast alone was worth the trip.',
  },
  {
    id: 2,
    name: 'Marcus K.',
    country: 'Germany 🇩🇪',
    rating: 10,
    date: '2026-06',
    title: 'Best boutique hotel in Turkey',
    text: 'We stayed 5 nights and didn\'t want to leave. The wine tour to Urla\'s vineyards arranged by the concierge was exceptional. The staff anticipates your needs before you even realize them.',
  },
  {
    id: 3,
    name: 'Elena V.',
    country: 'Russia 🇷🇺',
    rating: 9,
    date: '2026-07',
    title: 'Quiet luxury redefined',
    text: 'Nourla is exactly what modern luxury should feel like — understated, natural, and deeply personal. The stone architecture combined with minimalist interiors creates a perfect harmony.',
  },
  {
    id: 4,
    name: 'James & Priya T.',
    country: 'United Kingdom 🇬🇧',
    rating: 10,
    date: '2026-05',
    title: 'Our honeymoon retreat',
    text: 'We chose Nourla for our honeymoon and it exceeded every expectation. The private garden suite felt like our own olive estate. Breakfast served on the veranda each morning was pure magic.',
  },
  {
    id: 5,
    name: 'Ahmet B.',
    country: 'İstanbul 🇹🇷',
    rating: 10,
    date: '2026-08',
    title: "İzmir'in en iyi butik oteli",
    text: "Urla'nın doğasıyla tamamen bütünleşmiş bir tasarım. Her süit özenle döşenmiş, personel samimi ve ilgili. İstanbul'un gürültüsünden kaçmak için mükemmel bir sığınak.",
  },
];

const AGGREGATE_RATING_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'Nourla Boutique Hotel',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '9.8',
    reviewCount: '47',
    bestRating: '10',
    worstRating: '1',
  },
  review: REVIEWS.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '10',
    },
    reviewBody: r.text,
    datePublished: r.date,
    name: r.title,
  })),
};

function StarRating({ score, max = 10 }) {
  const stars = Math.round((score / max) * 5);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${score} / ${max} puan`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= stars ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function GuestReviews() {
  return (
    <section
      className="py-12 sm:py-20 bg-[#2B2B2B] text-white relative overflow-hidden"
      aria-label="Misafir yorumları"
    >
      <StructuredData id="jsonld-reviews" schema={AGGREGATE_RATING_SCHEMA} />

      {/* Subtle bg glow */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 60%, #6F7255 0%, transparent 55%), radial-gradient(circle at 85% 20%, #6F7255 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-7 sm:mb-12 px-4">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#6F7255] uppercase block mb-2">
            MİSAFİR DENEYİMLERİ
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-white leading-tight mb-3">
            Konuklarımız Ne Söylüyor?
          </h2>
          {/* Score badge */}
          <div className="inline-flex items-center gap-2 bg-[#6F7255]/20 border border-[#6F7255]/40 px-4 py-2 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-white font-semibold text-sm">9.8 / 10</span>
            <span className="text-[#E7E1D3]/60 text-xs hidden sm:inline">— 47 doğrulanmış yorum</span>
            <span className="text-[#E7E1D3]/60 text-[10px] sm:hidden">· 47 yorum</span>
          </div>
        </div>

        {/* ── MOBILE: horizontal scroll, 1 card at a time ─────── */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto pb-5 px-4 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} mobile />
          ))}
          {/* Trailing spacer */}
          <div className="shrink-0 w-4" aria-hidden />
        </div>

        {/* Scroll dots — mobile only */}
        <div className="flex items-center justify-center gap-1.5 mb-2 md:hidden">
          {REVIEWS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === 0 ? 'w-5 h-1.5 bg-[#6F7255]' : 'w-1.5 h-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* ── DESKTOP: 3-col + 2-col row ───────────────────────── */}
        <div className="hidden md:block px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-5">
            {REVIEWS.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5 mt-5 max-w-2xl mx-auto">
            {REVIEWS.slice(3, 5).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, mobile }) {
  return (
    <article
      className={`
        bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3
        hover:bg-white/[0.08] hover:border-[#6F7255]/40 transition-all
        ${mobile ? 'snap-start shrink-0 w-[85vw] max-w-[340px]' : ''}
      `}
      itemScope
      itemType="https://schema.org/Review"
    >
      {/* Quote */}
      <Quote className="w-5 h-5 text-[#6F7255] opacity-50 shrink-0" />

      {/* Text */}
      <p
        className="text-xs sm:text-sm text-[#E7E1D3]/80 font-light leading-relaxed flex-1 italic"
        itemProp="reviewBody"
      >
        "{review.text}"
      </p>

      {/* Title */}
      <p className="text-[11px] font-semibold text-[#6F7255]" itemProp="name">
        {review.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          <span
            className="block text-xs font-semibold text-white"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <span itemProp="name">{review.name}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#E7E1D3]/50 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {review.country}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRating score={review.rating} />
          <span className="text-[10px] text-[#E7E1D3]/40">
            <meta itemProp="datePublished" content={review.date} />
            {review.date}
          </span>
        </div>
      </div>
    </article>
  );
}
