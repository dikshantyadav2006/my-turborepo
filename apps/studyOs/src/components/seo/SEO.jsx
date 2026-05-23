import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sai Library';
const BASE_URL = 'https://study.sailibrary.online';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const TWITTER_HANDLE = '@sailibrary';

/**
 * Centralized SEO component.
 *
 * Props:
 *  title        – Page title (will be appended with " | Sai Library")
 *  description  – Meta description (max ~160 chars)
 *  keywords     – Array of keyword strings
 *  canonical    – Canonical path e.g. "/typing"  (prepended with BASE_URL)
 *  ogImage      – OG image URL (defaults to DEFAULT_OG_IMAGE)
 *  robots       – "index,follow" | "noindex,nofollow" etc.
 *  schema       – JSON-LD schema object or array of objects
 *  noTitleSuffix – Skip " | Sai Library" suffix
 */
export function SEO({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  robots = 'index,follow',
  schema,
  noTitleSuffix = false,
}) {
  const fullTitle = noTitleSuffix
    ? title
    : title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} Study OS – Focus, Tasks, Typing & Analytics`;

  const metaDescription =
    description ||
    'Sai Library Study OS – Your premium productivity workspace with Pomodoro timers, typing practice, task management, and analytics. Free, fast, offline-ready.';

  const canonicalUrl = canonical
    ? `${BASE_URL}${canonical.startsWith('/') ? canonical : '/' + canonical}`
    : BASE_URL;

  const image = ogImage || DEFAULT_OG_IMAGE;
  const kw = keywords.length ? keywords.join(', ') : 'study app, productivity, typing test, pomodoro timer, focus mode, task manager, sai library';

  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={kw} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}

// ─── Pre-built schema helpers ──────────────────────────────────────────────────

export const schemaWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  description: 'Premium study OS with typing master, focus timers, task management and productivity analytics.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: 'https://www.sailibrary.online',
  logo: `${BASE_URL}/icons/icon-512x512.png`,
  sameAs: [],
};

export const schemaSoftwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sai Library Study OS',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  url: BASE_URL,
  description: 'Free study productivity app with Pomodoro timer, typing master, task management, and leaderboard.',
};

export function schemaBreadcrumb(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function schemaFAQ(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
