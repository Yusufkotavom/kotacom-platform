import type { MetadataRoute } from 'next'

import {
  fetchArchives,
  fetchCaseStudies,
  fetchPages,
  fetchPosts,
  fetchProducts,
} from '@data/index'

export const dynamic = 'force-dynamic'

const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kotacom.id').replace(/\/$/, '')

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn()
  } catch {
    // Never let a DB hiccup break the sitemap (build/edge).
    return fallback
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/produk`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/posts`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/case-studies`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tentang`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/kontak`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const [pages, posts, caseStudies, products, archives] = await Promise.all([
    safe(() => fetchPages(), []),
    safe(() => fetchPosts(), []),
    safe(() => fetchCaseStudies(), []),
    safe(() => fetchProducts(), []),
    safe(() => fetchArchives(), []),
  ])

  const entries: MetadataRoute.Sitemap = []

  // Internal/test pages that must never be indexed or listed.
  const EXCLUDE = new Set(['/home', '/sample-blocks', '/preview', '/thanks-for-subscribing'])

  for (const page of pages) {
    const url = page?.breadcrumbs?.[page.breadcrumbs.length - 1]?.url
    if (url && url !== '/' && !EXCLUDE.has(url) && !page?.noindex) {
      entries.push({ url: `${base}${url}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 })
    }
  }

  for (const post of posts) {
    if (post?.slug) {
      entries.push({
        url: `${base}/posts/${post.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  for (const category of archives) {
    if (category?.slug) {
      entries.push({
        url: `${base}/posts/${category.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  for (const study of caseStudies) {
    if (study?.slug) {
      entries.push({
        url: `${base}/case-studies/${study.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  for (const product of products) {
    if (product?.slug) {
      entries.push({
        url: `${base}/produk/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  // De-dupe by URL, keeping the first (highest priority) occurrence.
  const seen = new Set<string>()
  return [...staticRoutes, ...entries].filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })
}
