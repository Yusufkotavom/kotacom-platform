import type { Metadata } from 'next'

import { buildSafe } from '@root/utilities/buildSafe'
import { JsonLd } from '@components/SEO/JsonLd'
import { PayloadRedirects } from '@components/PayloadRedirects/index'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave/index'
import { fetchProduct, fetchProducts } from '@data'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema, productSchema } from '@root/seo/schema'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

import { Product } from './client_page'

// Rendered on demand; the product query is cached at the data layer (ISR) so the
// page is served from cache between admin edits. Keep it build-safe: generateStaticParams
// is wrapped in buildSafe so prerendering never hard-depends on the DB.

const getProduct = (slug, draft) =>
  draft
    ? fetchProduct(slug)
    : unstable_cache(fetchProduct, [`product-${slug}`], { revalidate: 300 })(slug)

const ProductBySlug = async ({ params }) => {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params

  const url = `/produk/${slug}`

  const product = await getProduct(slug, draft)

  if (!product) {
    return <PayloadRedirects url={url} />
  }

  return (
    <>
      <PayloadRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Produk & Layanan', url: '/produk' },
            { name: product.title, url: `/produk/${slug}` },
          ]),
          productSchema(product),
        ]}
      />
      <Product {...product} />
    </>
  )
}

export default ProductBySlug

export async function generateStaticParams() {
  // Build-safe: no DB at build time → prerender nothing, render on demand.
  return buildSafe(
    'products.params',
    async () => {
      const getProducts = unstable_cache(fetchProducts, ['products'])
      const products = await getProducts()
      return products.map(({ slug }) => ({ slug }))
    },
    [],
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const product = await getProduct(slug, draft)

  return buildMetadata({
    kind: (product?.offeringType as never) || 'product',
    path: `/produk/${slug}`,
    title: product?.title,
    metaTitle: product?.meta?.title,
    metaDescription: product?.meta?.description,
    excerpt: product?.shortDescription,
    metaImage: product?.meta?.image,
    featuredImage: product?.featuredImage,
  })
}
