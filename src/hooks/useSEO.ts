import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'ElectroPrice';
const DEFAULT_DESCRIPTION = 'Compare prices across thousands of electronics. Find the best deals on smartphones, laptops, headphones, cameras, TVs, and gaming.';
const DEFAULT_KEYWORDS = ['price comparison', 'electronics', 'deals', 'smartphones', 'laptops', 'headphones', 'cameras', 'TVs', 'gaming'];

export const useSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  ogUrl,
  jsonLd,
}: SEOProps = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Find the Best Deals`;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords.join(', '));
    setMeta('robots', 'index, follow');

    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', SITE_NAME, true);

    if (ogImage) setMeta('og:image', ogImage, true);
    if (ogUrl) setMeta('og:url', ogUrl, true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage);

    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    let jsonLdEl = document.getElementById('json-ld-seo') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdEl) {
        jsonLdEl = document.createElement('script');
        jsonLdEl.type = 'application/ld+json';
        jsonLdEl.id = 'json-ld-seo';
        document.head.appendChild(jsonLdEl);
      }
      jsonLdEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...jsonLd,
      });
    } else if (jsonLdEl) {
      jsonLdEl.remove();
    }

    return () => {
      const el = document.getElementById('json-ld-seo');
      if (el) el.remove();
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, ogUrl, jsonLd]);
};
