import type { Metadata } from 'next'
import React from 'react'

import { JsonLd } from '@components/SEO/JsonLd'
import { KotacomBauhausHome } from '@components/nb/Home'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { localBusinessSchema } from '@root/seo/schema'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: 'Kotacom — Solusi IT, Website, Software & Percetakan Surabaya',
  description:
    'Kotacom adalah mitra IT & percetakan terpercaya sejak 2008: pembuatan website, software development, IT support, hingga cetak buku, brosur, dan kemasan untuk bisnis Anda.',
  openGraph: mergeOpenGraph({ url: '/' }),
}

export default function HomePage() {
  return (
    <React.Fragment>
      {/* Organization + WebSite are emitted site-wide in the root layout.
          Home adds LocalBusiness (geo/hours/address) for local SEO. */}
      <JsonLd schema={[localBusinessSchema()]} />
      <KotacomBauhausHome />
    </React.Fragment>
  )
}
