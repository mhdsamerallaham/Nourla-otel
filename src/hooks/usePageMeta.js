import { useEffect } from 'react';

const SITE_URL = 'https://www.nourla.com.tr';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-nourla.jpg`;

/**
 * usePageMeta — client-side meta tag updater for SPA SEO.
 *
 * Updates document.title, meta description, canonical, OG tags,
 * and hreflang alternates on every route change.
 *
 * @param {Object} options
 * @param {string} options.title          - Page <title> (without site suffix)
 * @param {string} options.description    - Meta description (150-160 chars)
 * @param {string} [options.canonical]    - Canonical URL path (e.g. "/tr/rooms")
 * @param {string} [options.ogImage]      - Absolute OG image URL
 * @param {string} [options.lang]         - Current language code
 */
export function usePageMeta({ title, description, canonical, ogImage, lang = 'tr' }) {
  useEffect(() => {
    const fullTitle = `${title} | Nourla Boutique Hotel — Urla, İzmir`;
    const canonicalUrl = canonical
      ? `${SITE_URL}${canonical}`
      : `${SITE_URL}/${lang}`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    // ── document.title ──────────────────────────────────────────
    document.title = fullTitle;

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

    // ── Meta description ────────────────────────────────────────
    setMeta('meta[name="description"]', description);

    // ── Canonical ───────────────────────────────────────────────
    setLink('canonical', canonicalUrl);

    // ── Open Graph ──────────────────────────────────────────────
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:url"]', canonicalUrl);
    setMeta('meta[property="og:type"]', 'website');
    setMeta('meta[property="og:locale"]', lang === 'tr' ? 'tr_TR' : lang === 'de' ? 'de_DE' : lang === 'ru' ? 'ru_RU' : 'en_US');
    setMeta('meta[property="og:site_name"]', 'Nourla Boutique Hotel');

    // ── Twitter / X Card ────────────────────────────────────────
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', image);

    // ── hreflang alternates ─────────────────────────────────────
    const basePath = canonical ? canonical.replace(/^\/(tr|en|de|ru)/, '') : '';
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
    {
      const xd = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
      const el = xd || document.createElement('link');
      if (!xd) {
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', 'x-default');
        document.head.appendChild(el);
      }
      el.setAttribute('href', `${SITE_URL}/tr${basePath}`);
    }
  }, [title, description, canonical, ogImage, lang]);
}
