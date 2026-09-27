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

/** WebPage — generic page node, tied into the site graph. */
export const webPageSchema = (opts: {
  name: string
  url: string
  description?: string | null
  image?: string
  datePublished?: string | null
  dateModified?: string | null
}): Schema => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${abs(opts.url)}#webpage`,
  name: opts.name,
  url: abs(opts.url),
  description: opts.description || undefined,
  image: opts.image || undefined,
  datePublished: opts.datePublished || undefined,
  dateModified: opts.dateModified || opts.datePublished || undefined,
  isPartOf: { '@id': `${base}/#website` },
  about: { '@id': `${base}/#organization` },
  inLanguage: 'id-ID',
})

/* -------------------------------------------------------------------------- */
/* Lexical content extraction — pull FAQ pairs & a description out of a page's */
/* `content` blocks so service/landing pages emit FAQPage + a real meta desc.  */
/* -------------------------------------------------------------------------- */

type LexNode = { type?: string; tag?: string; text?: string; children?: LexNode[] }

const nodeText = (node?: LexNode): string => {
  if (!node) return ''
  const out: string[] = []
  const walk = (n: LexNode) => {
    if (typeof n.text === 'string') out.push(n.text)
    if (Array.isArray(n.children)) n.children.forEach(walk)
  }
  walk(node)
  return out.join(' ').replace(/\s+/g, ' ').trim()
}

/** Extract FAQ {question, answer} pairs from a page/product `layout` (looks for
 * a `content` block whose richText has an h2 "Pertanyaan…" followed by h3 Q + p A). */
export const extractFaqsFromLayout = (
  layout?: unknown,
): { question: string; answer: string }[] => {
  if (!Array.isArray(layout)) return []
  const faqs: { question: string; answer: string }[] = []
  for (const block of layout as Record<string, unknown>[]) {
    const rt = (block?.contentFields as Record<string, unknown>)?.columnOne as
      | { root?: LexNode }
      | undefined
    const root = rt?.root
    if (!root?.children) continue
    let inFaq = false
    let currentQ = ''
    for (const child of root.children) {
      const isHeading = child.type === 'heading'
      const tag = child.tag
      const text = nodeText(child)
      if (isHeading && tag === 'h2') {
        inFaq = /pertanyaan|faq|tanya/i.test(text)
        currentQ = ''
        continue
      }
      if (!inFaq) continue
      if (isHeading && (tag === 'h3' || tag === 'h4')) {
        currentQ = text
      } else if (child.type === 'paragraph' && currentQ && text) {
        faqs.push({ question: currentQ, answer: text })
        currentQ = ''
      }
    }
  }
  return faqs
}

/** First meaningful paragraph across a page/product `layout` — a real description. */
export const extractDescriptionFromLayout = (layout?: unknown): string => {
  if (!Array.isArray(layout)) return ''
  for (const block of layout as Record<string, unknown>[]) {
    const rt = (block?.contentFields as Record<string, unknown>)?.columnOne as
      | { root?: LexNode }
      | undefined
    const root = rt?.root
    if (!root?.children) continue
    for (const child of root.children) {
      if (child.type === 'paragraph') {
        const t = nodeText(child)
        if (t && t.length > 40) return t
      }
    }
  }
  return ''
}

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
