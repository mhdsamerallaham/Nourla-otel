import React, { useEffect } from 'react';

/**
 * StructuredData — injects a JSON-LD <script> into <head>.
 * Cleans up on unmount to avoid duplicate schema blocks.
 *
 * @param {Object} props
 * @param {Object} props.schema - The JSON-LD object to serialize
 * @param {string} [props.id]   - Unique DOM id to prevent duplicates
 */
export default function StructuredData({ schema, id = 'jsonld-default' }) {
  useEffect(() => {
    // Remove any existing script with this id
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [schema, id]);

  return null;
}

// ── Pre-built schema factories ────────────────────────────────────────────────

/** LodgingBusiness schema — mount once in App.jsx */
export const HOTEL_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': 'https://www.nourla.com.tr/#hotel',
  name: 'Nourla Boutique Hotel',
  alternateName: 'Nourla Otel',
  url: 'https://www.nourla.com.tr/',
  logo: 'https://www.nourla.com.tr/og-nourla.jpg',
  image: 'https://www.nourla.com.tr/og-nourla.jpg',
  description:
    'Nourla Boutique Hotel is an exclusive 10-suite luxury retreat nestled among ancient olive groves and historic stone architecture in Urla, İzmir, Turkey. Experience farm-to-table gastronomy, vineyard wine tours, and Aegean serenity.',
  telephone: '+902327540000',
  email: 'info@nourla.com.tr',
  priceRange: '€€€€',
  currenciesAccepted: 'TRY, EUR, USD',
  paymentAccepted: 'Cash, Credit Card',
  starRating: {
    '@type': 'Rating',
    ratingValue: '5',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'İskele Mahallesi 2222/5 Sokak No: 4/1',
    addressLocality: 'Urla',
    addressRegion: 'İzmir',
    postalCode: '35430',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.342027,
    longitude: 26.767377,
  },
  hasMap: 'https://maps.app.goo.gl/nourla',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday',
    ],
    opens: '00:00',
    closes: '23:59',
  },
  checkinTime: '15:00',
  checkoutTime: '12:00',
  numberOfRooms: 10,
  petsAllowed: true,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'EV Charging Station', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Airport Transfer', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Breakfast', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Spa & Wellness', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Wine Tasting', value: true },
  ],
  sameAs: [
    'https://www.instagram.com/nourlahotel',
    'https://www.facebook.com/nourlahotel',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '9.6',
    reviewCount: '47',
    bestRating: '10',
    worstRating: '1',
  },
};

/** FAQPage schema — used in Contact.jsx */
export function buildFaqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  };
}

/** BreadcrumbList schema — used in Breadcrumb.jsx */
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `https://www.nourla.com.tr${item.href}` : undefined,
    })),
  };
}

/** HotelRoom schema — used in RoomDetail.jsx */
export function buildRoomSchema(room) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.description,
    url: `https://www.nourla.com.tr/tr/rooms/${room.id}`,
    image: `https://www.nourla.com.tr${room.image}`,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: parseInt(room.size) || undefined,
      unitCode: 'MTK',
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: parseInt(room.capacity) || 2,
    },
    amenityFeature: (room.features || []).map((f) => ({
      '@type': 'LocationFeatureSpecification',
      name: f,
      value: true,
    })),
    offers: {
      '@type': 'Offer',
      price: room.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    containedInPlace: {
      '@id': 'https://www.nourla.com.tr/#hotel',
    },
  };
}
