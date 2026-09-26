import type { Metadata } from 'next'

import { buildSafe } from '@root/utilities/buildSafe'
import { JsonLd } from '@components/SEO/JsonLd'
import { PayloadRedirects } from '@components/PayloadRedirects/index'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave/index'
import { fetchCaseStudies, fetchCaseStudy } from '@data'
import { buildMetadata } from '@root/seo/metadata'
import { articleSchema, breadcrumbSchema } from '@root/seo/schema'
import { richTextToPlain } from '@root/utilities/richTextToPlain'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

import { CaseStudy } from './client_page'

// Rendered on demand; the case-study query is cached at the data layer (ISR) so the
// page is served from cache between admin edits. Keep it build-safe: generateStaticParams
// is wrapped in buildSafe so prerendering never hard-depends on the DB.

const getCaseStudy = (slug, draft) =>
  draft
    ? fetchCaseStudy(slug)
    : unstable_cache(fetchCaseStudy, [`case-study-${slug}`], { revalidate: 300 })(slug)

const CaseStudyBySlug = async ({ params }) => {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params

  const url = `/case-studies/${slug}`

  const caseStudy = await getCaseStudy(slug, draft)

  if (!caseStudy) {
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
            { name: 'Studi Kasus', url: '/case-studies' },
            { name: caseStudy.title || slug, url: `/case-studies/${slug}` },
          ]),
          articleSchema({
            title: caseStudy.title,
            slug,
            excerpt: caseStudy.meta?.description,
            image: caseStudy.meta?.image as never,
            updatedAt: caseStudy.updatedAt,
          }),
        ]}
      />
      <CaseStudy {...caseStudy} />
    </>
  )
}

export default CaseStudyBySlug

export async function generateStaticParams() {
  // Build-safe: no DB at build time → prerender nothing, render on demand.
  return buildSafe('caseStudies.params', async () => {
  const getCaseStudies = unstable_cache(fetchCaseStudies, ['caseStudies'])
  const caseStudies = await getCaseStudies()

  return caseStudies.map(({ slug }) => ({
    slug,
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
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const page = await getCaseStudy(slug, draft)

  return buildMetadata({
    kind: 'caseStudy',
    path: `/case-studies/${slug}`,
    title: page?.title,
    metaTitle: page?.meta?.title,
    metaDescription: page?.meta?.description,
    excerpt: richTextToPlain(page?.introContent),
    metaImage: page?.meta?.image,
    featuredImage: page?.featuredImage,
    ogTypeOverride: 'article',
    publishedTime: page?.updatedAt,
  })
}
