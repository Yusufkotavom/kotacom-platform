import { buildSafe } from '@root/utilities/buildSafe'
import type { Metadata } from 'next'

import { Hero } from '@components/Hero/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { PayloadRedirects } from '@components/PayloadRedirects'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave'
import { RenderBlocks } from '@components/RenderBlocks/index'
import { fetchPage, fetchPages } from '@data'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema } from '@root/seo/schema'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

const getPage = async (slug, draft?) =>
  draft
    ? fetchPage(slug)
    : unstable_cache(fetchPage, [`page-${slug}`], { revalidate: 300 })(slug)

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

  return (
    <React.Fragment>
      <PayloadRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <JsonLd
        schema={breadcrumbSchema(
          (page.breadcrumbs || []).map((b) => ({
            name: (b.label as string) || 'Halaman',
            url: b.url as string,
          })),
        )}
      />
      <Hero firstContentBlock={page.layout[0]} page={page} />
      <RenderBlocks blocks={page.layout} hero={page.hero} />
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
    excerpt: page?.description,
    metaImage: page?.meta?.image,
    noindex: page?.noindex,
  })
}
