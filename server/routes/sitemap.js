'use strict';

const express = require('express');
const router = express.Router();

const DOMAIN = 'https://www.nourla.com.tr';

const LANGUAGES = ['tr', 'en', 'de', 'ru'];
const PAGES = [
  { slug: '', priority: '1.0', changefreq: 'daily' },
  { slug: 'rooms', priority: '0.9', changefreq: 'weekly' },
  { slug: 'about', priority: '0.8', changefreq: 'monthly' },
  { slug: 'urla', priority: '0.8', changefreq: 'weekly' },
  { slug: 'sustainability', priority: '0.7', changefreq: 'monthly' },
  { slug: 'gallery', priority: '0.7', changefreq: 'monthly' },
  { slug: 'contact', priority: '0.9', changefreq: 'daily' },
  { slug: 'reservation', priority: '0.9', changefreq: 'daily' },
  { slug: 'privacy-policy', priority: '0.3', changefreq: 'yearly' },
];

const ROOM_SLUGS = [
  'deluxe-stone-suite',
  'olive-garden-suite',
  'presidential-aegean-suite',
  'heritage-courtyard-suite',
];

/**
 * Dynamic sitemap XML endpoint for Googlebot & Google Search Console
 * Always returns real-time ISO dates for lastmod
 */
router.get('/sitemap.xml', (_req, res) => {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  LANGUAGES.forEach((lang) => {
    PAGES.forEach((page) => {
      const pagePath = page.slug ? `/${lang}/${page.slug}` : `/${lang}`;
      const url = `${DOMAIN}${pagePath}`;

      xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;

      LANGUAGES.forEach((altLang) => {
        const altPath = page.slug ? `/${altLang}/${page.slug}` : `/${altLang}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}${altPath}" />\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/tr${page.slug ? `/${page.slug}` : ''}" />\n`;
      xml += `  </url>\n`;
    });

    ROOM_SLUGS.forEach((roomSlug) => {
      const roomUrl = `${DOMAIN}/${lang}/rooms/${roomSlug}`;
      xml += `  <url>
    <loc>${roomUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
`;
      LANGUAGES.forEach((altLang) => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}/${altLang}/rooms/${roomSlug}" />\n`;
      });
      xml += `  </url>\n`;
    });
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(xml);
});

module.exports = router;
