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
      : {
          '@type': 'GeoCoordinates',
          latitude: -7.3195,
          longitude: 112.7667,
        }

  const primaryAddress = {
    '@type': 'PostalAddress',
    streetAddress: settings?.street || 'Jl. Tenggilis Mulya 76',
    addressLocality: settings?.city || 'Surabaya',
    addressRegion: settings?.region || 'Jawa Timur',
    postalCode: settings?.postalCode || '60292',
    addressCountry: settings?.country || 'ID',
  }

  const branchAddress = {
    '@type': 'PostalAddress',
    streetAddress: 'Graha Indraprasta G7/15, Tulangan',
    addressLocality: 'Sidoarjo',
    addressRegion: 'Jawa Timur',
    postalCode: '61273',
    addressCountry: 'ID',
  }

  const serviceAreas = [
    'Surabaya',
    'Sidoarjo',
    'Gresik',
    'Mojokerto',
    'Pasuruan',
    'Malang',
    'Indonesia',
  ]

  const offerCatalog = {
    '@type': 'OfferCatalog',
    name: 'Katalog Layanan Kotacom',
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'IT Services & Hardware Solution',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service Komputer & Laptop' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pengadaan Komputer & Rakit PC' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Instalasi Jaringan & Server' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Digital & Software Development',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Jasa Pembuatan Website & SEO' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Aplikasi Custom & Sistem POS Kasir' } },
        ],
      },
      {
        '@type': 'OfferCatalog',
        name: 'Percetakan & Digital Printing',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cetak Buku, Majalah & Katalog' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cetak Brosur, Banner & Kemasan' } },
        ],
      },
    ],
  }

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': `${base}/#localbusiness`,
    name: settings?.businessName || 'Kotacom IT Service & Percetakan',
    image: mediaUrl(settings?.defaultOgImage) || `${base}/icon.png`,
    logo: mediaUrl(settings?.logo) || `${base}/icon.png`,
    url: base,
    telephone: settings?.phone || '+6285799520350',
    email: settings?.email || 'halo@kotacom.id',
    address: primaryAddress,
    geo,
    openingHours: settings?.openingHours || 'Mo-Sa 08:00-17:00',
    priceRange: '$$',
    areaServed: serviceAreas.map((city) => ({
      '@type': 'Place',
      name: city,
    })),
    hasOfferCatalog: offerCatalog,
    department: [
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        name: 'Kotacom Surabaya Office',
        address: primaryAddress,
        telephone: settings?.phone || '+6285799520350',
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService'],
        name: 'Kotacom Sidoarjo Office',
        address: branchAddress,
        telephone: '+6285799520350',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '48',
      bestRating: '5',
    },
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
  areaServed?: string | string[]
  startingPrice?: number
  aggregateRating?: { ratingValue: number; reviewCount: number; bestRating?: number } | null
}): Schema => {
  const rating = opts.aggregateRating ?? {
    ratingValue: 5,
    reviewCount: 48,
    bestRating: 5,
  }

  const areaServed = Array.isArray(opts.areaServed)
    ? opts.areaServed.map((a) => ({ '@type': 'Place', name: a }))
    : opts.areaServed || 'ID'

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description || undefined,
    url: abs(opts.url),
    image: opts.image,
    provider: { '@id': `${base}/#organization` },
    areaServed,
    ...(opts.startingPrice
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.startingPrice,
            priceCurrency: 'IDR',
          },
        }
      : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(rating.ratingValue),
      reviewCount: String(rating.reviewCount),
      bestRating: String(rating.bestRating || 5),
    },
  }
}

export const productSchema = (
  product: Partial<Product>,
  opts?: {
    aggregateRating?: { ratingValue: number; reviewCount: number; bestRating?: number } | null
  },
): Schema => {
  const image = mediaUrl(product.featuredImage as never) || undefined
  const rating = opts?.aggregateRating ?? {
    ratingValue: 5,
    reviewCount: 48,
    bestRating: 5,
  }

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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(rating.ratingValue),
      reviewCount: String(rating.reviewCount),
      bestRating: String(rating.bestRating || 5),
    },
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

/** Fallback FAQs for landing/programmatic pages based on intent keyword */
export const getClusterFallbackFaqs = (
  slug: string,
): { question: string; answer: string }[] => {
  const s = slug.toLowerCase()

  if (
    s.includes('cetak') ||
    s.includes('buku') ||
    s.includes('percetakan') ||
    s.includes('offset') ||
    s.includes('brosur') ||
    s.includes('kalender') ||
    s.includes('packaging') ||
    s.includes('kemasan') ||
    s.includes('banner')
  ) {
    return [
      {
        question: 'Bagaimana cara menentukan jenis kertas dan spesifikasi cetak yang tepat?',
        answer:
          'Tim Kotacom siap membantu konsultasi pemilihan kertas (Bookpaper, HVS, Art Paper, Ivory), gramatur, hingga jilid finishing (lem panas, jahitan benang, spiral, hardcover) sesuai kebutuhan dan anggaran Anda.',
      },
      {
        question: 'Berapa lama estimasi waktu proses cetak di Kotacom?',
        answer:
          'Waktu produksi berkisar 2-5 hari kerja untuk cetak digital/proof, dan 5-10 hari kerja untuk kuantiti offset atau buku tebal setelah file fix siap cetak.',
      },
      {
        question: 'Apakah ada minimal order pemesanan cetak?',
        answer:
          'Kami melayani skala digital printing tanpa minimal order (POD / Print On Demand), serta cetak skala besar (offset) dengan harga per satuan yang jauh lebih hemat.',
      },
      {
        question: 'Apakah Kotacom melayani pengiriman ke luar kota / seluruh Indonesia?',
        answer:
          'Ya, kami bekerja sama dengan berbagai ekspedisi kargo darat, laut, dan udara untuk pengiriman aman ke seluruh wilayah Indonesia.',
      },
    ]
  }

  if (
    s.includes('website') ||
    s.includes('web') ||
    s.includes('software') ||
    s.includes('aplikasi') ||
    s.includes('pos') ||
    s.includes('kasir') ||
    s.includes('sistem')
  ) {
    return [
      {
        question: 'Berapa lama proses pembuatan website atau software di Kotacom?',
        answer:
          'Website company profile standar selesai dalam 1-2 minggu kerja. Untuk aplikasi web custom atau software manajemen / POS membutuhkan waktu 3-6 minggu tergantung kompleksitas fitur.',
      },
      {
        question: 'Apakah website sudah termasuk domain, hosting, dan optimasi SEO?',
        answer:
          'Semua paket website Kotacom sudah termasuk konfigurasi domain, cloud server berkecepatan tinggi, SSL keamanan, serta fondasi Technical SEO lengkap.',
      },
      {
        question: 'Apakah ada garansi dan bantuan teknis setelah website/aplikasi selesai?',
        answer:
          'Ya, kami menyediakan garansi pemeliharaan, panduan penggunaan, serta tim technical support siap membantu operasional harian bisnis Anda.',
      },
    ]
  }

  if (
    s.includes('service') ||
    s.includes('komputer') ||
    s.includes('laptop') ||
    s.includes('rakit') ||
    s.includes('jaringan') ||
    s.includes('instal') ||
    s.includes('it-') ||
    s.includes('maintenance') ||
    s.includes('perbaikan')
  ) {
    return [
      {
        question: 'Berapa biaya pengecekan dan diagnosa di Kotacom?',
        answer:
          'Diagnosa awal transparan dan kami selalu menginformasikan rincian kerusakan serta biaya estimasi sebelum tindakan perbaikan dilakukan.',
      },
      {
        question: 'Apakah melayani panggilan ke kantor, sekolah, atau rumah?',
        answer:
          'Ya, teknisi Kotacom melayani kunjungan onsite/panggilan untuk area Surabaya, Sidoarjo, dan sekitarnya sesuai kesepakatan jadwal.',
      },
      {
        question: 'Apakah setiap perbaikan atau sparepart bergaransi?',
        answer:
          'Semua penggantian sparepart dan pengerjaan servis di Kotacom dilengkapi garansi resmi demi kenyamanan dan kepuasan pelanggan.',
      },
    ]
  }

  return []
}

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
