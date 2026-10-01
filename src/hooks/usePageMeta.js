import { useEffect } from 'react';

const SITE_URL = 'https://www.nourla.com.tr';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-nourla.jpg`;

/**
 * Clean & truncate a string to maximum length at word boundary
 */
function truncateText(str, maxLen = 155) {
  if (!str || str.length <= maxLen) return str || '';
  const truncated = str.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Format a title strictly under 60 characters
 */
function formatTitle(rawTitle) {
  if (!rawTitle) return 'Nourla Boutique Hotel — Urla, İzmir';
  let title = rawTitle.trim();

  // If already includes Nourla, don't append brand suffix
  if (/nourla/i.test(title)) {
    return title.length > 59 ? truncateText(title, 59) : title;
  }

  const suffix = ' | Nourla Hotel';
  if ((title + suffix).length <= 59) {
    return title + suffix;
  }

  const shortSuffix = ' | Nourla';
  if ((title + shortSuffix).length <= 59) {
    return title + shortSuffix;
  }

  return truncateText(title, 59);
}

/**
 * usePageMeta — comprehensive meta & Open Graph tag updater for Technical SEO & GEO.
 *
 * @param {Object} options
 * @param {string} options.title          - Page title (targeted <60 chars)
 * @param {string} options.description    - Meta description (targeted <155 chars)
 * @param {string} [options.canonical]    - Relative canonical path (e.g. "/tr/rooms")
 * @param {string} [options.ogImage]      - Absolute or relative OG image URL
 * @param {string} [options.ogType]       - OpenGraph type (default: 'website')
 * @param {string} [options.lang]         - Current language code ('tr', 'en', 'de', 'ru')
 * @param {boolean} [options.noIndex]     - Set to true for 404, status, or private pages
 */
export function usePageMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  lang = 'tr',
  noIndex = false,
}) {
  useEffect(() => {
    const finalTitle = formatTitle(title);
    const finalDesc = truncateText(description, 155);

    // Canonical URL calculation
    const cleanCanonical = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
      : `${SITE_URL}/${lang}`;

    // Image URL resolution
    const image = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
      : DEFAULT_OG_IMAGE;

    // ── document.title ──────────────────────────────────────────
    document.title = finalTitle;

    // ── Helper: upsert a <meta> tag ─────────────────────────────
    const setMeta = (selector, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const attr = selector.includes('property=') ? 'property' : 'name';
        const val = selector.replace(/.*["']([^"']+)["'].*/, '$1');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // ── Helper: upsert a <link> tag ─────────────────────────────
    const setLink = (rel, href, extra = {}) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
    };

    // ── Robots meta ─────────────────────────────────────────────
    setMeta('meta[name="robots"]', noIndex ? 'noindex, nofollow' : 'index, follow');

    // ── Meta description ────────────────────────────────────────
    setMeta('meta[name="description"]', finalDesc);

    // ── Canonical link ──────────────────────────────────────────
    setLink('canonical', cleanCanonical);

    // ── Open Graph ──────────────────────────────────────────────
    setMeta('meta[property="og:title"]', finalTitle);
    setMeta('meta[property="og:description"]', finalDesc);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:url"]', cleanCanonical);
    setMeta('meta[property="og:type"]', ogType);
    setMeta(
      'meta[property="og:locale"]',
      lang === 'tr'
        ? 'tr_TR'
        : lang === 'de'
        ? 'de_DE'
        : lang === 'ru'
        ? 'ru_RU'
        : 'en_US'
    );
    setMeta('meta[property="og:site_name"]', 'Nourla Boutique Hotel');

    // ── Twitter / X Card ────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', finalTitle);
    setMeta('meta[name="twitter:description"]', finalDesc);
    setMeta('meta[name="twitter:image"]', image);

    // ── hreflang alternates ─────────────────────────────────────
    if (!noIndex) {
      const basePath = canonical
        ? canonical.replace(/^\/(tr|en|de|ru)/, '')
        : '';

      ['tr', 'en', 'de', 'ru'].forEach((l) => {
        const selector = `link[rel="alternate"][hreflang="${l}"]`;
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('link');
          el.setAttribute('rel', 'alternate');
          el.setAttribute('hreflang', l);
          document.head.appendChild(el);
        }
        el.setAttribute('href', `${SITE_URL}/${l}${basePath}`);
      });

      // ── x-default hreflang ──────────────────────────────────────
      const xd = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
      const el = xd || document.createElement('link');
      if (!xd) {
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', 'x-default');
        document.head.appendChild(el);
      }
      el.setAttribute('href', `${SITE_URL}/tr${basePath}`);
    }
  }, [title, description, canonical, ogImage, ogType, lang, noIndex]);
}

