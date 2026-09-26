import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { Gutter } from '@components/Gutter/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'

import classes from './index.module.scss'

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
      <div className={classes.wrapper}>
        <BackgroundGrid zIndex={0} />
        <Gutter>
          <header className={classes.header}>
            <p className={classes.eyebrow}>Katalog</p>
            <h1 className={classes.heading}>Produk & Layanan</h1>
            <p className={classes.lead}>
              Layanan, portofolio, dan produk Kotacom — satu mitra untuk kebutuhan digital dan
              cetak bisnis Anda.
            </p>
          </header>

          {products.length === 0 ? (
            <p className={classes.empty}>Belum ada produk yang dipublikasikan.</p>
          ) : (
            OFFERINGS.map((group) => {
              const rows = products.filter((p) => (p.offeringType || 'service') === group.value)
              if (rows.length === 0) return null
              return (
                <section className={classes.group} key={group.value}>
                  <h2 className={classes.groupTitle}>{group.label}</h2>
                  <ul className={classes.grid}>
                    {rows.map((row) => (
                      <li className={classes.item} key={row.slug}>
                        <Link className={classes.cardLink} href={`/produk/${row.slug}`}>
                          <span className={classes.cardTitle}>{row.title}</span>
                          <span className={classes.cardCta}>Lihat detail →</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })
          )}
        </Gutter>
      </div>
    </React.Fragment>
  )
}
