import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://www.nourla.com.tr';
const TODAY = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

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

export function generateSitemapXml() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // 1. Static Pages for each language
  LANGUAGES.forEach((lang) => {
    PAGES.forEach((page) => {
      const pagePath = page.slug ? `/${lang}/${page.slug}` : `/${lang}`;
      const url = `${DOMAIN}${pagePath}`;

      xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;

      // hreflang alternate links
      LANGUAGES.forEach((altLang) => {
        const altPath = page.slug ? `/${altLang}/${page.slug}` : `/${altLang}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}${altPath}" />\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/tr${page.slug ? `/${page.slug}` : ''}" />\n`;
      xml += `  </url>\n`;
    });

    // 2. Room Detail pages
    ROOM_SLUGS.forEach((roomSlug) => {
      const roomUrl = `${DOMAIN}/${lang}/rooms/${roomSlug}`;
      xml += `  <url>
    <loc>${roomUrl}</loc>
    <lastmod>${TODAY}</lastmod>
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
  return xml;
}

// Write to public/sitemap.xml
function main() {
  try {
    const sitemapContent = generateSitemapXml();
    const publicPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(publicPath, sitemapContent, 'utf8');
    console.log(`[SITEMAP AUTO-GEN] ✓ Successfully generated public/sitemap.xml with updated lastmod: ${TODAY}`);
  } catch (err) {
    console.error('[SITEMAP AUTO-GEN ERROR]', err.message);
  }
}

main();
