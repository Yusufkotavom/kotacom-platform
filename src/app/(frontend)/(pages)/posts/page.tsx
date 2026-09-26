import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@components/SEO/JsonLd'
import { Card } from '@components/nb/Card'
import { Pill } from '@components/nb/Pill'
import { Section, SectionTag } from '@components/nb/Section'
import { buildMetadata } from '@root/seo/metadata'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'
import { uniqueBySlug } from '@root/utilities/uniqueBy'

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
  const posts = uniqueBySlug(await fetchPosts())

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
      <Section bg="canvas">
        <SectionTag index="00" label="Blog" />
        <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
          Artikel &amp; Wawasan
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed">
          Panduan praktis, tips, dan cerita dari tim Kotacom — untuk membantu bisnis Anda tumbuh.
        </p>
      </Section>

      {posts.length === 0 ? (
        <Section bg="paper">
          <p className="font-bold uppercase">Belum ada artikel yang dipublikasikan.</p>
        </Section>
      ) : (
        <Section bg="paper">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const cat = categoryOf(post)
              const shapes = ['circle', 'square', 'triangle', 'diamond'] as const
              const tones = ['yellow', 'blue', 'red', 'yellow'] as const
              return (
                <Link key={post.slug} href={`/posts/${post.slug}`} className="block">
                  <Card
                    className="h-full p-6"
                    cornerShape={shapes[i % 4]}
                    cornerTone={tones[i % 4]}
                  >
                    {cat?.name ? <Pill tone="red">{cat.name}</Pill> : null}
                    <span className="mt-4 block text-xl font-black uppercase leading-tight tracking-tight">
                      {post.title}
                    </span>
                    <span className="mt-3 block font-mono text-xs font-bold uppercase tracking-widest">
                      Baca artikel &rarr;
                    </span>
                  </Card>
                </Link>
              )
            })}
          </div>
        </Section>
      )}
    </React.Fragment>
  )
}
