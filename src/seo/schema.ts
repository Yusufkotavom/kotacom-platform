import type { Media, Product, SiteSetting } from '@root/payload-types'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id').replace(/\/$/, '')

const abs = (url?: string | null): string | undefined => {
  if (!url) return undefined
  return url.startsWith('http') ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const mediaUrl = (media?: Media | number | string | null): string | undefined => {
  if (!media || typeof media !== 'object') return undefined
  return abs(media.url)
}

type Schema = Record<string, unknown>

export const organizationSchema = (settings?: SiteSetting | null): Schema => {
  const socials = (settings?.socials || [])
    .map((s) => s?.url)
    .filter((u): u is string => Boolean(u))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: settings?.businessName || 'Kotacom',
    legalName: settings?.legalName || undefined,
    url: base,
    logo: mediaUrl(settings?.logo) || `${base}/icon.png`,
    description: settings?.description || undefined,
    foundingDate: settings?.foundedYear || undefined,
    sameAs: socials.length ? socials : undefined,
    contactPoint: settings?.phone
      ? [
          {
            '@type': 'ContactPoint',
            telephone: settings.phone,
            contactType: 'customer service',
            areaServed: 'ID',
            availableLanguage: ['id'],
          },
        ]
      : undefined,
    address: addressSchema(settings),
  }
}

export const addressSchema = (settings?: SiteSetting | null): Schema | undefined => {
  if (!settings?.city && !settings?.street) return undefined
  return {
    '@type': 'PostalAddress',
    streetAddress: settings?.street || undefined,
    addressLocality: settings?.city || undefined,
    addressRegion: settings?.region || undefined,
    postalCode: settings?.postalCode || undefined,
    addressCountry: settings?.country || 'ID',
  }
}

export const localBusinessSchema = (settings?: SiteSetting | null): Schema => {
  const geo =
    settings?.geo?.latitude && settings?.geo?.longitude
      ? {
          '@type': 'GeoCoordinates',
          latitude: settings.geo.latitude,
          longitude: settings.geo.longitude,
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${base}/#localbusiness`,
    name: settings?.businessName || 'Kotacom',
    image: mediaUrl(settings?.defaultOgImage) || `${base}/icon.png`,
    url: base,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    address: addressSchema(settings),
    geo,
    openingHours: settings?.openingHours || undefined,
    priceRange: '$$',
  }
}

export const websiteSchema = (settings?: SiteSetting | null): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${base}/#website`,
  name: settings?.businessName || 'Kotacom',
  url: base,
  publisher: { '@id': `${base}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${base}/posts?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

export const breadcrumbSchema = (
  items: { name: string; url: string }[],
): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: abs(item.url),
  })),
})

export const articleSchema = (post: {
  title?: string | null
  slug?: string | null
  publishedOn?: string | null
  updatedAt?: string | null
  excerpt?: string | null
  image?: (number | Media) | null
  authors?: unknown
  authorName?: string | null
  url?: string | null
}): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title || undefined,
  description: post.excerpt || undefined,
  image: mediaUrl(post.image) || undefined,
  datePublished: post.publishedOn || undefined,
  dateModified: post.updatedAt || post.publishedOn || undefined,
  mainEntityOfPage: post.url ? abs(post.url) : post.slug ? `${base}/posts/${post.slug}` : base,
  author: post.authorName
    ? { '@type': 'Person', name: post.authorName }
    : { '@type': 'Organization', name: 'Kotacom' },
  publisher: { '@id': `${base}/#organization` },
})

export const serviceSchema = (opts: {
  name: string
  description?: string | null
  url: string
  image?: string
  areaServed?: string
}): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: opts.name,
  description: opts.description || undefined,
  url: abs(opts.url),
  image: opts.image,
  provider: { '@id': `${base}/#organization` },
  areaServed: opts.areaServed || 'ID',
})

export const productSchema = (product: Partial<Product>): Schema => {
  const image = mediaUrl(product.featuredImage as never) || undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || undefined,
    description: product.shortDescription || undefined,
    image,
    category: product.offeringType || undefined,
    url: product.slug ? `${base}/produk/${product.slug}` : base,
    brand: { '@type': 'Brand', name: 'Kotacom' },
    offers: product.price
      ? {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          url: product.slug ? `${base}/produk/${product.slug}` : base,
        }
      : undefined,
  }
}

export const faqSchema = (faqs: { question: string; answer: string }[]): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
})

/** ItemList — a list of URLs (product/service archives, search results). */
export const itemListSchema = (items: { name: string; url: string }[]): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: abs(it.url),
  })),
})

/** CollectionPage — a hub page that lists other entities (e.g. /produk, /case-studies). */
export const collectionPageSchema = (opts: {
  name: string
  url: string
  description?: string | null
  items?: { name: string; url: string }[]
}): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: opts.name,
  url: abs(opts.url),
  description: opts.description || undefined,
  isPartOf: { '@id': `${base}/#website` },
  mainEntity: opts.items
    ? itemListSchema(opts.items)
    : undefined,
})
