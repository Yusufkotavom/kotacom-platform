import type { Metadata } from 'next'

import { buildSafe } from '@root/utilities/buildSafe'
import BreadcrumbsBar from '@components/Hero/BreadcrumbsBar/index'
import { PayloadRedirects } from '@components/PayloadRedirects/index'
import { Post } from '@components/Post/index'
import { RefreshRouteOnSave } from '@components/RefreshRouterOnSave/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { fetchBlogPost, fetchPosts } from '@data'
import { buildMetadata } from '@root/seo/metadata'
import { articleSchema, breadcrumbSchema } from '@root/seo/schema'
import { richTextToPlain } from '@root/utilities/richTextToPlain'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { permanentRedirect } from 'next/navigation'
import React from 'react'

const getPost = async (slug, category, draft?) =>
  draft
    ? await fetchBlogPost(slug, category)
    : await unstable_cache(fetchBlogPost, ['blogPost', `post-${slug}`], { revalidate: 300 })(
        slug,
        category,
      )

const PostPage = async ({
  params,
}: {
  params: Promise<{
    category: string
    slug: any
  }>
}) => {
  const { isEnabled: draft } = await draftMode()
  const { slug, category } = await params

  const blogPost = await getPost(slug, category, draft)

  const url = `/${category}/${slug}`

  // Canonical permalink for a post is the FLAT /posts/<slug>. The
  // category-qualified URL 308-redirects there so search engines consolidate
  // on one URL. Skipped in draft preview so the editor can preview this shape.
  if (blogPost && !draft) {
    permanentRedirect(`/posts/${slug}`)
  }

  if (!blogPost) {
    return <PayloadRedirects url={url} />
  }

  return (
    <React.Fragment>
      <PayloadRedirects disableNotFound url={url} />
      <RefreshRouteOnSave />
      <BreadcrumbsBar breadcrumbs={[]} hero={{ type: 'default' }} />
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Artikel', url: '/posts' },
            { name: blogPost.title || slug, url: `/posts/${slug}` },
          ]),
          articleSchema({
            title: blogPost.title,
            slug,
            url: `/posts/${slug}`,
            publishedOn: blogPost.publishedOn,
            updatedAt: blogPost.updatedAt,
            excerpt: blogPost.meta?.description || richTextToPlain(blogPost.excerpt),
            image: (blogPost.image || blogPost.meta?.image) as never,
          }),
        ]}
      />
      <Post {...blogPost} />
    </React.Fragment>
  )
}

export default PostPage

export async function generateStaticParams() {
  // Build-safe: no DB at build time → prerender nothing, render on demand.
  return buildSafe(
    'post.params',
    async () => {
      const getPosts = unstable_cache(fetchPosts, ['allPosts'])
      const posts = await getPosts()

      return posts
        .map(({ slug, category }) => {
          if (!category || typeof category === 'string' || !category.slug) {
            return null
          }

          return {
            slug,
            category: category.slug,
          }
        })
        .filter(Boolean)
    },
    [],
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    category: string
    slug: string
  }>
}): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug, category } = await params
  const post = await getPost(slug, category, draft)

  return buildMetadata({
    kind: 'post',
    path: `/posts/${slug}`,
    title: post?.title,
    metaTitle: post?.meta?.title,
    metaDescription: post?.meta?.description,
    excerpt: richTextToPlain(post?.excerpt),
    metaImage: post?.meta?.image,
    featuredImage: post?.featuredMedia === 'upload' ? post?.image : null,
    ogTypeOverride: 'article',
    publishedTime: post?.publishedOn,
  })
}
