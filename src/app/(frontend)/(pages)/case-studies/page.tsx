import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@components/SEO/JsonLd'
import { Card } from '@components/nb/Card'
import { Section, SectionTag } from '@components/nb/Section'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'
import { uniqueBySlug } from '@root/utilities/uniqueBy'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/case-studies' },
  description:
    'Studi kasus nyata proyek Kotacom — dari percetakan buku dan kemasan hingga sistem digital untuk bisnis dan institusi di Indonesia.',
  openGraph: mergeOpenGraph({ title: 'Studi Kasus', url: '/case-studies' }),
  title: 'Studi Kasus — Portofolio Proyek Kotacom',
}

const fetchCaseStudies = async (): Promise<{ title?: string; slug?: string }[]> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.find({
      collection: 'case-studies',
      depth: 0,
      limit: 500,
      select: { slug: true, title: true },
    })
    return data.docs as { title?: string; slug?: string }[]
  } catch {
    return []
  }
}

export default async function CaseStudiesIndex() {
  const studies = uniqueBySlug(await fetchCaseStudies())

  return (
    <React.Fragment>
      <JsonLd
        schema={[
          breadcrumbSchema([
            { name: 'Beranda', url: '/' },
            { name: 'Studi Kasus', url: '/case-studies' },
          ]),
          collectionPageSchema({
            name: 'Studi Kasus Kotacom',
            url: '/case-studies',
            description: 'Portofolio proyek Kotacom.',
            items: studies
              .filter((s) => s.slug)
              .map((s) => ({ name: s.title || (s.slug as string), url: `/case-studies/${s.slug}` })),
          }),
        ]}
      />
      <Section bg="canvas">
        <SectionTag index="00" label="Portofolio" />
        <h1 className="mt-4 text-4xl uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
          Studi Kasus
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed">
          Proyek nyata yang kami kerjakan — setiap hasil punya cerita, tantangan, dan angka.
        </p>
      </Section>
      {studies.length === 0 ? (
        <Section bg="paper">
          <p className="font-bold uppercase">Belum ada studi kasus yang dipublikasikan.</p>
        </Section>
      ) : (
        <Section bg="paper">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studies.map((study, i) => (
              <Link key={study.slug} href={`/case-studies/${study.slug}`} className="block">
                <Card
                  className="h-full p-6"
                  cornerShape={(['circle', 'square', 'triangle', 'diamond'] as const)[i % 4]}
                  cornerTone={(['yellow', 'blue', 'red', 'yellow'] as const)[i % 4]}
                >
                  <span className="text-xl font-black uppercase leading-tight tracking-tight">
                    {study.title}
                  </span>
                  <span className="mt-3 block font-mono text-xs font-bold uppercase tracking-widest">
                    Lihat studi kasus &rarr;
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </React.Fragment>
  )
}
