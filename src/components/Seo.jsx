import { useEffect } from 'react'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteImageUrl,
  absoluteUrl,
} from '../config/seo'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets document title + meta/OG tags for the current route.
 */
export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = absoluteImageUrl(),
  noindex = false,
  keywords = DEFAULT_KEYWORDS,
}) {
  useEffect(() => {
    const url = absoluteUrl(path)
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', keywords)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')

    upsertLink('canonical', url)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('property', 'og:locale', 'en_MU')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', image)

    upsertMeta('name', 'application-name', SITE_NAME)
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME)
  }, [title, description, path, image, noindex, keywords])

  return null
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ['Spark', 'Spark Distributors Ltd', 'Spark Mauritius Order Platform'],
    url: SITE_URL,
    logo: absoluteImageUrl('/logo.png'),
    image: absoluteImageUrl('/banner.png'),
    description: DEFAULT_DESCRIPTION,
    email: 'Sparkdistributorsltd@gmail.com',
    telephone: '+23057657918',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'General de Gaulles Street',
      addressLocality: 'Curepipe',
      addressRegion: 'Plaines Wilhems',
      addressCountry: 'MU',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -20.3142,
      longitude: 57.5206,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Mauritius',
    },
    sameAs: [
      'https://www.facebook.com/sparkmauritius.mu/',
      'https://www.instagram.com/spark.mauritius/',
      'https://www.tiktok.com/@spark.mauritius',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+23057657918',
      contactType: 'customer service',
      areaServed: 'MU',
      availableLanguage: ['English', 'French'],
    },
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-MU',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
