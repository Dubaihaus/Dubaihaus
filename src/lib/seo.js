import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

const DOMAIN = 'https://www.dubaihaus.com';

/**
 * Generates the Next.js alternates object for canonical and hreflang tags.
 * @param {string} pathname - The route path without locale (e.g. '', '/off-plan', '/blog/my-post')
 * @param {string} queryString - Optional query string to append to canonical URL
 * @returns {object} Next.js alternates object
 */
export async function getAlternates(pathname = '', queryString = '') {
  const normalizedPath = pathname && !pathname.startsWith('/') ? `/${pathname}` : pathname;
  const querySuffix = queryString ? `?${queryString}` : '';

  const h = await headers();
  const currentLocale = h.get('x-next-locale') || 'en';

  return {
    canonical: `${DOMAIN}/${currentLocale}${normalizedPath}${querySuffix}`,
    languages: {
      'en': `${DOMAIN}/en${normalizedPath}${querySuffix}`,
      'de': `${DOMAIN}/de${normalizedPath}${querySuffix}`,
      'x-default': `${DOMAIN}/en${normalizedPath}${querySuffix}`,
    },
  };
}

/**
 * Shared wrapper for standard metadata to ensure consistency across pages.
 */
export async function generateStandardMetadata({
  locale,
  pathname = '',
  queryString = '',
  title,
  description,
  keywords,
  images = [],
  index = true,
  follow = true,
}) {
  const h = await headers();
  const currentLocale = locale || h.get('x-next-locale') || 'en';

  const normalizedPath = pathname && !pathname.startsWith('/') ? `/${pathname}` : pathname;
  const querySuffix = queryString ? `?${queryString}` : '';
  const canonicalUrl = `${DOMAIN}/${currentLocale}${normalizedPath}${querySuffix}`;

  const siteName = 'DubaiHaus';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${DOMAIN}/en${normalizedPath}${querySuffix}`,
        'de': `${DOMAIN}/de${normalizedPath}${querySuffix}`,
        'x-default': `${DOMAIN}/en${normalizedPath}${querySuffix}`,
      },
    },
    openGraph: {
      title,
      description,
      keywords,
      url: canonicalUrl,
      siteName,
      type: 'website',
      images: images.length > 0 ? images : undefined,
      locale: locale === 'en' ? 'en_US' : 'de_DE',
      alternateLocale: locale === 'en' ? ['de_DE'] : ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
    robots: {
      index,
      follow,
    },
    other: {
      'x-seo-canonical': canonicalUrl,
      'x-seo-locale': currentLocale,
      'x-seo-robots': index ? 'index, follow' : 'noindex, follow',
    }
  };
}

// ------ JSON-LD Helpers ------

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${DOMAIN}/#organization`,
    "name": "DubaiHaus",
    "url": `${DOMAIN}/`,
    "logo": `${DOMAIN}/logo.png`,
    "description": "DubaiHaus is an independent platform for discovering off-plan real estate projects in Dubai and Abu Dhabi.",
    "sameAs": [
      "https://www.tiktok.com/@dubaihaus.com?_t=ZS-90ypelf0PUw&_r=1",
      "https://www.facebook.com/share/1DEkRn4pMb/?mibextid=wwXIfr",
      "https://www.instagram.com/dubai_haus?igsh=MWRoNmF1emwwanh4cg%3D%3D&utm_source=qr",
      "https://youtube.com/@dubaihaus?si=nS7Q64bf6gPWSD_k",
      "https://x.com/dubaihaus?s=21&t=a4oLtuzI6wKe-l8h8goJ5g"
    ]
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${DOMAIN}/#website`,
    "url": `${DOMAIN}/`,
    "name": "DubaiHaus",
    "inLanguage": "en", // The base schema language
    "publisher": {
      "@id": `${DOMAIN}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${DOMAIN}/off-plan?query={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function getBreadcrumbSchema(items) {
  // items: [{ name: "Home", item: "https://www.dubaihaus.com/en" }, ...]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item
    }))
  };
}

export function getArticleSchema({ title, description, image, datePublished, dateModified, authorName = "DubaiHaus Team", url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": authorName,
      "url": `${DOMAIN}/`
    },
    "publisher": {
      "@id": `${DOMAIN}/#organization`
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };
}
