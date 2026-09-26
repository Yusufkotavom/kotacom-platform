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

type Row = {
  title?: string
  slug?: string
  publishedOn?: string
  category?: { name?: string; slug?: string } | string | number
}

const fetchPosts = async (): Promise<Row[]> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.find({
      collection: 'posts',
      depth: 1,
      limit: 300,
      sort: '-publishedOn',
      select: { slug: true, title: true, publishedOn: true, category: true },
    })
    return data.docs as Row[]
  } catch {
    return []
  }
}

const categoryOf = (row: Row) =>
  row.category && typeof row.category === 'object' ? row.category : undefined

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    kind: 'archive',
    path: '/posts',
    title: 'Artikel & Blog',
    excerpt:
      'Artikel, panduan, dan wawasan dari Kotacom seputar percetakan, pembuatan website, software, dan growth bisnis.',
  })
}

export default async function PostsIndex() {
  const posts = await fetchPosts()

  const items = posts
    .filter((p) => p.slug)
    .map((p) => ({ name: p.title || (p.slug as string), url: `/posts/${p.slug}` }))

  return (
    <React.Fragment>
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Artikel', url: '/posts' },
          ]),
          collectionPageSchema({
            name: 'Artikel Kotacom',
            url: '/posts',
            description: 'Daftar artikel dan blog Kotacom.',
            items,
          }),
        ]}
      />
      <div className={classes.wrapper}>
        <BackgroundGrid zIndex={0} />
        <Gutter>
          <header className={classes.header}>
            <p className={classes.eyebrow}>Blog</p>
            <h1 className={classes.heading}>Artikel & Wawasan</h1>
            <p className={classes.lead}>
              Panduan praktis, tips, dan cerita dari tim Kotacom — untuk membantu bisnis Anda
              tumbuh.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className={classes.empty}>Belum ada artikel yang dipublikasikan.</p>
          ) : (
            <ul className={classes.grid}>
              {posts.map((post) => {
                const cat = categoryOf(post)
                return (
                  <li className={classes.item} key={post.slug}>
                    <Link className={classes.cardLink} href={`/posts/${post.slug}`}>
                      {cat?.name && <span className={classes.cardMeta}>{cat.name}</span>}
                      <span className={classes.cardTitle}>{post.title}</span>
                      <span className={classes.cardCta}>Baca artikel →</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Gutter>
      </div>
    </React.Fragment>
  )
}
