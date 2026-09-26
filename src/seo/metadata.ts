import type { Media } from '@root/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { normalizeSeoDescription, normalizeSeoTitle } from '@root/seo/normalize'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id').replace(/\/$/, '')

export type SeoKind = 'page' | 'post' | 'product' | 'service' | 'portfolio' | 'caseStudy' | 'archive'

// Maps our entity kinds to the label set understood by /api/og.
const ogType: Record<SeoKind, string> = {
  archive: 'blog',
  caseStudy: 'caseStudy',
  page: 'page',
  portfolio: 'product',
  post: 'blog',
  product: 'product',
  service: 'service',
}

const mediaUrl = (media?: Media | number | string | null): string | undefined => {
  if (!media || typeof media !== 'object' || !('url' in media)) return undefined
  const url = (media as Media).url
  if (!url) return undefined
  return url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length ? v : undefined

export type BuildMetadataInput = {
  kind: SeoKind
  /** Canonical path, e.g. `/posts/foo` or `/produk/bar`. */
  path: string
  /** Entity display title (fallback when no meta.title). */
  title?: string | null
  metaTitle?: string | null
  /** meta.description, when the editor set one. */
  metaDescription?: string | null
  /** Excerpt / shortDescription used when meta.description is empty. */
  excerpt?: string | null
  /** meta.image (upload). */
  metaImage?: Media | number | string | null
  /** featuredImage / image — used when no meta.image. */
  featuredImage?: Media | number | string | null
  noindex?: boolean | null
  /** OpenGraph type for entity pages: use 'article' for posts/case-studies. */
  ogTypeOverride?: string
  publishedTime?: string | null
}

/**
 * Build an optimized Next.js `Metadata` object for any content entity.
 *
 * - Title: `meta.title` (normalized) when present, else the entity title left
 *   for the root `%s | Kotacom` template to complete.
 * - Description: `meta.description` → `excerpt` → normalized to ~120–155 chars.
 * - Image: `meta.image` → `featuredImage` → generated `/api/og` fallback.
 */
export const buildMetadata = (input: BuildMetadataInput): Metadata => {
  const rawTitle = asString(input.metaTitle) ?? asString(input.title) ?? ''
  const rawDescription =
    asString(input.metaDescription) ?? asString(input.excerpt) ?? ''

  const description = normalizeSeoDescription(rawDescription) || undefined

  // When the editor supplied a meta title we take full control (absolute) so
  // the root template doesn't double-append " | Kotacom". Otherwise we let the
  // template complete the entity title.
  const title: Metadata['title'] = asString(input.metaTitle)
    ? { absolute: normalizeSeoTitle(input.metaTitle) }
    : rawTitle || undefined

  const image =
    mediaUrl(input.metaImage) ||
    mediaUrl(input.featuredImage) ||
    `${siteUrl}/api/og?type=${ogType[input.kind]}&title=${encodeURIComponent(rawTitle || 'Kotacom')}`

  const ogTitle =
    normalizeSeoTitle(rawTitle) || 'Kotacom — Solusi IT, Website, Software & Percetakan'

  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: input.path },
    openGraph: mergeOpenGraph({
      type: (input.ogTypeOverride ?? 'website') as 'website',
      title: ogTitle,
      description: description ?? undefined,
      url: input.path,
      images: [{ url: image }],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    }),
    twitter: { card: 'summary_large_image' },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
