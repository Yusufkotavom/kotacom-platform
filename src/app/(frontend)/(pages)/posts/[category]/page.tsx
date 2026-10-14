import type { Metadata } from 'next'

import { Archive } from '@components/Archive'
import { BauhausPost } from '@components/nb/Post'
import { JsonLd } from '@components/SEO/JsonLd'
import {
  fetchArchive,
  fetchArchives,
  fetchPostBySlug,
  fetchPosts,
  fetchRelatedPosts,
} from '@data'
import { buildMetadata } from '@root/seo/metadata'
import {
  articleSchema,
  breadcrumbSchema,
  collectionPageSchema,
  faqSchema,
  getClusterFallbackFaqs,
} from '@root/seo/schema'
import { buildSafe } from '@root/utilities/buildSafe'
import { richTextToPlain } from '@root/utilities/richTextToPlain'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React from 'react'

/**
 * One route serves two shapes under /posts:
 *   /posts/<category>  -> a category archive
 *   /posts/<slug>      -> a single post (the canonical, FLAT permalink)
 *
 * The flat form is canonical; the category-qualified /posts/<category>/<slug>
 * 308-redirects here (see [category]/[slug]/page.tsx), so every post has a
 * single, stable URL that search engines and the admin preview agree on.
 */
const PostsSegment = async ({
  params,
}: {
  params: Promise<{
    category: string
  }>
}) => {
  const { category } = await params
  const { isEnabled: draft } = await draftMode()

  // 1. try it as a category archive
  const archive = draft
    ? await fetchArchive(category, draft)
    : await unstable_cache(fetchArchive, [`${category}-archive`], { revalidate: 300 })(category, draft)

  if (archive?.posts?.docs) {
    const posts = archive.posts.docs as { title?: string; slug?: string }[]
    return (
      <React.Fragment>
        <JsonLd
          schema={[
            breadcrumbSchema([
              { name: 'Beranda', url: '/' },
              { name: 'Artikel', url: '/posts' },
              { name: archive.name || category, url: `/posts/${category}` },
            ]),
            collectionPageSchema({
              name: archive.name || category,
              url: `/posts/${category}`,
              description: archive.description,
              items: posts
                .filter((p) => p?.slug)
                .map((p) => ({
                  name: p.title || (p.slug as string),
                  url: `/posts/${p.slug}`,
                })),
            }),
          ]}
        />
        <Archive category={category} />
      </React.Fragment>
    )
  }

  // 2. otherwise treat the segment as a flat post slug (canonical permalink)
  const post = draft
    ? await fetchPostBySlug(category)
    : await unstable_cache(fetchPostBySlug, [`post-${category}`], { revalidate: 300 })(category)

  if (!post) {
    notFound()
  }

  const slug = post.slug || category
  const authorName =
    Array.isArray(post.authors) && (post.authors[0] as any)?.name
      ? (post.authors[0] as any).name
      : typeof post.guestAuthor === 'string'
        ? post.guestAuthor
        : null
  const categoryName = typeof post.category === 'object' ? post.category?.name : null
  const categoryId = typeof post.category === 'object' ? (post.category as any)?.id : undefined
  const relatedPosts = await fetchRelatedPosts(post.id, categoryId, 3)

  // Cluster FAQ schema for rich snippet enhancements
  const faqs = getClusterFallbackFaqs(slug)

  return (
    <React.Fragment>
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Artikel', url: '/posts' },
            ...(categoryName && typeof post.category === 'object' && post.category?.slug
              ? [{ name: categoryName, url: `/posts/${post.category.slug}` }]
              : []),
            { name: post.title || slug, url: `/posts/${slug}` },
          ]),
          articleSchema({
            title: post.title,
            slug,
            url: `/posts/${slug}`,
            publishedOn: post.publishedOn,
            updatedAt: post.updatedAt,
            excerpt: post.meta?.description || richTextToPlain(post.excerpt),
            image: (post.image || post.meta?.image) as never,
            authorName,
            articleSection: categoryName,
          }),
          ...(faqs && faqs.length > 0 ? [faqSchema(faqs)] : []),
        ]}
      />
      <BauhausPost post={post} relatedPosts={relatedPosts} />
    </React.Fragment>
  )
}

export default PostsSegment

export const generateStaticParams = async () => {
  // Build-safe: with no DB at build time prerender nothing; pages render on demand.
  return buildSafe(
    'posts.params',
    async () => {
      const [archives, posts] = await Promise.all([fetchArchives(), fetchPosts()])

      return [
        ...archives.map((archive) => ({ category: archive.slug })),
        ...posts
          .map((post) => (post?.slug ? { category: post.slug } : null))
          .filter((entry): entry is { category: string } => entry !== null),
      ]
    },
    [] as { category: string }[],
  )
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> => {
  const { category } = await params

  const archive = await fetchArchive(category)

  if (archive) {
    return buildMetadata({
      kind: 'archive',
      path: `/posts/${category}`,
      title: archive.name,
      excerpt: archive.description,
    })
  }

  const post = await fetchPostBySlug(category)

  if (post) {
    const authorName =
      Array.isArray(post.authors) && (post.authors[0] as any)?.name
        ? (post.authors[0] as any).name
        : typeof post.guestAuthor === 'string'
          ? post.guestAuthor
          : 'Kotacom'
    const categoryName = typeof post.category === 'object' ? post.category?.name : undefined

    return buildMetadata({
      kind: 'post',
      path: `/posts/${post.slug || category}`,
      title: post.title,
      metaTitle: post.meta?.title,
      metaDescription: post.meta?.description,
      excerpt: richTextToPlain(post.excerpt),
      metaImage: post.meta?.image,
      featuredImage: post.image,
      ogTypeOverride: 'article',
      publishedTime: post.publishedOn,
      modifiedTime: post.updatedAt,
      authorName,
      section: categoryName,
    })
  }

  return {}
}
