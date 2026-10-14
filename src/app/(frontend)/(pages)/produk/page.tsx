import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronRight, Package, Tag } from 'lucide-react'
import React from 'react'

import { JsonLd } from '@components/SEO/JsonLd'
import { Card } from '@components/nb/Card'
import { Pill } from '@components/nb/Pill'
import { Section, SectionTag } from '@components/nb/Section'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'
import { uniqueBySlug } from '@root/utilities/uniqueBy'

export const dynamic = 'force-dynamic'

const OFFERINGS = [
  { value: 'service', label: 'Layanan' },
  { value: 'portfolio', label: 'Portofolio' },
  { value: 'product', label: 'Produk' },
] as const

type Row = {
  title?: string
  slug?: string
  offeringType?: string
  featuredImage?: any
  price?: string
  shortDescription?: string
}

const fetchProducts = async (): Promise<Row[]> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 300,
      sort: 'title',
      select: {
        slug: true,
        title: true,
        offeringType: true,
        featuredImage: true,
        price: true,
        shortDescription: true,
      },
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
  const products = uniqueBySlug(await fetchProducts())

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
      <Section bg="canvas" className="border-b-4 border-ink">
        <div className="mx-auto max-w-7xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink/70"
          >
            <Link href="/" className="hover:text-nb-red hover:underline">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-ink">Produk & Layanan</span>
          </nav>

          <SectionTag index="00" label="Katalog" />
          <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl font-black">
            Produk &amp; Layanan
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed">
            Layanan, portofolio, dan produk Kotacom — satu mitra untuk kebutuhan digital dan cetak
            bisnis Anda.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t-4 border-ink pt-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
              Pintas Kategori:
            </span>
            {OFFERINGS.map((g) => {
              const count = products.filter((p) => (p.offeringType || 'service') === g.value).length
              if (count === 0) return null
              return (
                <a
                  key={g.value}
                  href={`#${g.value}`}
                  className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-nb-xs hover:bg-nb-yellow transition-colors"
                >
                  <span>{g.label}</span>
                  <span className="bg-ink text-white px-1.5 py-0.2 text-[10px]">{count}</span>
                </a>
              )
            })}
          </div>
        </div>
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
            <Section bg="paper" key={group.value} id={group.value} className="border-b-4 border-ink">
              <div className="mb-8 flex items-center justify-between border-b-4 border-ink pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
                    {group.label}
                  </h2>
                  <span className="border-2 border-ink bg-nb-yellow px-2 py-0.5 font-mono text-xs font-bold uppercase">
                    {rows.length} item
                  </span>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row, i) => {
                  const image =
                    row.featuredImage && typeof row.featuredImage === 'object'
                      ? row.featuredImage
                      : null

                  return (
                    <article
                      key={row.slug}
                      className="flex flex-col border-4 border-ink bg-paper shadow-nb-sm transition-transform hover:-translate-y-1 hover:shadow-nb"
                    >
                      {image?.url ? (
                        <div className="relative aspect-video w-full overflow-hidden border-b-4 border-ink bg-nb-canvas">
                          <Image
                            src={image.url}
                            alt={image.alt || row.title || 'Produk Kotacom'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center border-b-4 border-ink bg-nb-canvas">
                          <Package className="h-10 w-10 text-ink/30" />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Pill
                            tone={
                              group.value === 'service'
                                ? 'blue'
                                : group.value === 'product'
                                  ? 'red'
                                  : 'yellow'
                            }
                          >
                            {group.label}
                          </Pill>
                          {row.price && (
                            <span className="font-mono text-xs font-black uppercase text-nb-red">
                              {row.price}
                            </span>
                          )}
                        </div>

                        <h3 className="mb-2 line-clamp-2 font-display text-xl font-black leading-tight uppercase text-ink">
                          <Link
                            href={`/produk/${row.slug}`}
                            className="hover:text-nb-red hover:underline transition-colors"
                          >
                            {row.title}
                          </Link>
                        </h3>

                        {row.shortDescription && (
                          <p className="line-clamp-2 text-sm text-ink-muted">
                            {row.shortDescription}
                          </p>
                        )}

                        <div className="mt-auto pt-4 border-t-2 border-ink/10 flex items-center justify-between">
                          <Link
                            href={`/produk/${row.slug}`}
                            className="inline-flex items-center gap-1 font-display text-xs font-black uppercase text-nb-blue hover:text-nb-red transition-colors"
                          >
                            Lihat Detail
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </Section>
          )
        })
      )}
    </React.Fragment>
  )
}
