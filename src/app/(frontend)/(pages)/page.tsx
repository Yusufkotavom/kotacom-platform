import type { Metadata } from 'next'
import React from 'react'

import { BauhausBlocks } from '@components/nb/blocks/index'
import { ErrorBoundary } from '@components/ErrorTest'
import { Hero } from '@components/Hero/index'
import { PayloadRedirects } from '@components/PayloadRedirects'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave'
import { fetchHomePage } from '@data'
import { buildMetadata } from '@root/seo/metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchHomePage()

  if (!page) {
    return {
      title: 'Home',
      alternates: { canonical: '/' },
    }
  }

  return buildMetadata({
    kind: 'page',
    path: '/',
    title: page.title,
    metaTitle: page.meta?.title,
    metaDescription: page.meta?.description,
    metaImage: page.meta?.image,
    noindex: page.noindex,
  })
}

export default async function HomePage() {
  const page = await fetchHomePage()

  if (!page) {
    return <PayloadRedirects disableNotFound url="/" />
  }

  const hasHeroContent =
    page.hero &&
    (page.hero.type !== 'default' ||
      Boolean(page.hero.richText?.root?.children?.length) ||
      Boolean(page.hero.description?.root?.children?.length) ||
      Boolean(page.hero.links?.length))

  return (
    <React.Fragment>
      <PayloadRedirects disableNotFound url="/" />
      <RefreshRouteOnSave />
      <ErrorBoundary>
        {hasHeroContent && <Hero firstContentBlock={page.layout?.[0]} page={page} />}
        {page.layout && <BauhausBlocks blocks={page.layout} />}
      </ErrorBoundary>
    </React.Fragment>
  )
}
