import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@components/SEO/JsonLd'
import { Card } from '@components/nb/Card'
import { Section, SectionTag } from '@components/nb/Section'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'

export const dynamic = 'force-dynamic'

const OFFERINGS = [
  { value: 'service', label: 'Layanan' },
  { value: 'portfolio', label: 'Portofolio' },
  { value: 'product', label: 'Produk' },
] as const

type Row = { title?: string; slug?: string; offeringType?: string }

const fetchProducts = async (): Promise<Row[]> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 300,
      sort: 'title',
      select: { slug: true, title: true, offeringType: true },
    })
    return data.docs as Row[]
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    kind: 'page',
    path: '/produk',
    title: 'Produk & Layanan',
    excerpt:
      'Layanan dan produk Kotacom: pembuatan website, software, IT support, hingga percetakan buku, kemasan, dan signage untuk bisnis di seluruh Indonesia.',
  })
}

export default async function ProductsIndex() {
  const products = await fetchProducts()

  const items = products
    .filter((p) => p.slug)
    .map((p) => ({ name: p.title || (p.slug as string), url: `/produk/${p.slug}` }))

  return (
    <React.Fragment>
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Produk & Layanan', url: '/produk' },
          ]),
          collectionPageSchema({
            name: 'Produk & Layanan Kotacom',
            url: '/produk',
            description: 'Katalog layanan dan produk Kotacom.',
            items,
          }),
        ]}
      />
      <Section bg="canvas">
        <SectionTag index="00" label="Katalog" />
        <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
          Produk &amp; Layanan
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed">
          Layanan, portofolio, dan produk Kotacom — satu mitra untuk kebutuhan digital dan cetak
          bisnis Anda.
        </p>
      </Section>

      {products.length === 0 ? (
        <Section bg="paper">
          <p className="font-bold uppercase">Belum ada produk yang dipublikasikan.</p>
        </Section>
      ) : (
        OFFERINGS.map((group) => {
          const rows = products.filter((p) => (p.offeringType || 'service') === group.value)
          if (rows.length === 0) return null
          return (
            <Section bg="paper" key={group.value}>
              <h2 className="mb-8 text-3xl uppercase tracking-tighter">{group.label}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row, i) => (
                  <Link key={row.slug} href={`/produk/${row.slug}`} className="block">
                    <Card
                      className="h-full p-6"
                      cornerShape={(['circle', 'square', 'triangle', 'diamond'] as const)[i % 4]}
                      cornerTone={(['yellow', 'blue', 'red', 'yellow'] as const)[i % 4]}
                    >
                      <span className="text-xl font-black uppercase tracking-tight">
                        {row.title}
                      </span>
                      <span className="mt-3 block font-mono text-xs font-bold uppercase tracking-widest">
                        Lihat detail &rarr;
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </Section>
          )
        })
      )}
    </React.Fragment>
  )
}
