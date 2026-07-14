/** Canonical site config for SEO / Open Graph / JSON-LD */
export const SITE_URL = 'https://sparkmauritius.com'

export const SITE_NAME = 'Spark Mauritius'

export const SITE_TAGLINE =
  'Your one-stop online shop in Mauritius for high-quality products delivered to your doorstep.'

export const DEFAULT_TITLE =
  'Spark Mauritius | One-Stop Online Shop & Store in Mauritius'

export const DEFAULT_DESCRIPTION =
  'Shop online with Spark Mauritius — your one-stop shop in Mauritius for quality products delivered to your door. Fast ordering, WhatsApp support, delivery across Mauritius.'

export const DEFAULT_KEYWORDS = [
  'Spark Mauritius',
  'Spark',
  'online shop Mauritius',
  'online store Mauritius',
  'one stop shop Mauritius',
  'one-stop shop Mauritius',
  'shop online Mauritius',
  'delivery Mauritius',
  'Curepipe shop',
  'buy online Mauritius',
  'Spark Distributors',
].join(', ')

export const OG_IMAGE_PATH = '/banner.png'

export const CONTACT = {
  email: 'sparkdistributorsltd@gmail.com',
  phone: '+23057657918',
  address: {
    street: 'General de Gaulles Street',
    city: 'Curepipe',
    region: 'Plaines Wilhems',
    country: 'MU',
    countryName: 'Mauritius',
  },
  geo: {
    // Approximate Curepipe centre — update if you have exact coords
    latitude: -20.3142,
    longitude: 57.5206,
  },
}

export const PAGE_SEO = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  },
  contact: {
    title: 'Contact Spark Mauritius | Online Shop Support in Mauritius',
    description:
      'Contact Spark Mauritius in Curepipe. WhatsApp, email, and store location for orders, delivery questions, and online shop support across Mauritius.',
    path: '/contact',
  },
  checkout: {
    title: 'Checkout | Spark Mauritius Online Shop',
    description:
      'Complete your Spark Mauritius order for delivery across Mauritius. Secure checkout for our online store.',
    path: '/checkout',
    noindex: true,
  },
  orderSuccess: {
    title: 'Order Confirmed | Spark Mauritius',
    description: 'Your Spark Mauritius order has been placed successfully.',
    path: '/order-success',
    noindex: true,
  },
}

export function absoluteUrl(path = '/') {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function absoluteImageUrl(path = OG_IMAGE_PATH) {
  return absoluteUrl(path)
}
