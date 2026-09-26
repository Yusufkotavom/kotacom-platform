import type { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Kotacom adalah mitra IT & percetakan terpercaya sejak 2008: website, software, IT support, hingga cetak buku, brosur, dan kemasan untuk bisnis Anda.',
  images: [
    {
      url: '/api/og?title=Kotacom%20%E2%80%94%20Solusi%20IT%2C%20Website%2C%20Software%20%26%20Percetakan&type=home',
      width: 1200,
      height: 630,
    },
  ],
  siteName: 'Kotacom',
  title: 'Kotacom — Solusi IT, Website, Software & Percetakan Surabaya',
  url: siteUrl,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
