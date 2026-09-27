import { buildSafe } from '@root/utilities/buildSafe'
import type { Metadata } from 'next'

import { BauhausBlocks } from '@components/nb/blocks/index'
import { ErrorBoundary } from '@components/ErrorTest'
import { Hero } from '@components/Hero/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { PayloadRedirects } from '@components/PayloadRedirects'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave'
import { fetchPage, fetchPages } from '@data'
import { buildMetadata } from '@root/seo/metadata'
import {
  breadcrumbSchema,
  extractDescriptionFromLayout,
  extractFaqsFromLayout,
  faqSchema,
  serviceSchema,
  webPageSchema,
} from '@root/seo/schema'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

const getPage = async (slug, draft?) =>
  draft
    ? fetchPage(slug)
    : unstable_cache(fetchPage, [`page-${slug}`], { revalidate: 300 })(slug)

// Top-level "money" pages that are lead-gen service landing pages → emit Service
// schema (matches/extends the live kotacom.id graph). Anything else stays a WebPage.
const SERVICE_SLUGS = new Set([
  'percetakan',
  'pembuatan-website',
  'software',
  'sistem-pos',
  'layanan',
])

const Page = async ({
  params,
}: {
  params: Promise<{
    slug: any
  }>
}) => {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const url = '/' + (Array.isArray(slug) ? slug.join('/') : slug)

  const page = await getPage(slug, draft)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const breadcrumbs = (page.breadcrumbs || []).map((b) => ({
    name: (b.label as string) || 'Halaman',
    url: b.url as string,
  }))
  const desc =
    page.meta?.description || page.description || extractDescriptionFromLayout(page.layout) || null
  const faqs = extractFaqsFromLayout(page.layout)
  const topSlug = Array.isArray(slug) ? slug[0] : slug
  const isService = SERVICE_SLUGS.has(topSlug)

  const schema: Record<string, unknown>[] = [
    breadcrumbSchema(breadcrumbs.length ? breadcrumbs : [{ name: page.title || 'Halaman', url }]),
    webPageSchema({
      name: page.title || 'Halaman',
      url,
      description: desc,
      dateModified: (page as { updatedAt?: string }).updatedAt,
    }),
  ]
  if (isService) {
    schema.push(
      serviceSchema({
        name: page.title || 'Layanan Kotacom',
        description: desc,
        url,
        areaServed: 'ID',
      }),
    )
  }
  if (faqs.length) schema.push(faqSchema(faqs))

  return (
    <React.Fragment>
      <PayloadRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <JsonLd schema={schema} />
      <ErrorBoundary>
        <Hero firstContentBlock={page.layout[0]} page={page} />
        <BauhausBlocks blocks={page.layout} />
      </ErrorBoundary>
    </React.Fragment>
  )
}

export default Page

export async function generateStaticParams() {
  // Build-safe: no DB at build time → prerender nothing, render on demand.
  return buildSafe('pages.params', async () => {
  const getPages = unstable_cache(fetchPages, ['pages'])
  const pages = await getPages()

  return pages.map(({ breadcrumbs }) => ({
    slug: breadcrumbs?.[breadcrumbs.length - 1]?.url?.replace(/^\/|\/$/g, '').split('/'),
  }))
  }, [])
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: any
  }>
}): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await getPage(slug, draft)

  const canonical = '/' + (Array.isArray(slug) ? slug.join('/') : slug || '')

  return buildMetadata({
    kind: 'page',
    path: canonical,
    title: page?.title,
    metaTitle: page?.meta?.title,
    metaDescription: page?.meta?.description,
    excerpt: page?.description || extractDescriptionFromLayout(page?.layout),
    metaImage: page?.meta?.image,
    noindex: page?.noindex,
  })
}
