import type { Page } from '@root/payload-types'
import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import BreadcrumbsBar from '@components/Hero/BreadcrumbsBar/index'
import { Gutter } from '@components/Gutter/index'
import { JsonLd } from '@components/SEO/JsonLd'
import { mergeOpenGraph } from '@root/seo/mergeOpenGraph'
import { breadcrumbSchema, collectionPageSchema } from '@root/seo/schema'

import classes from './index.module.scss'

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
      limit: 100,
      select: { slug: true, title: true },
    })
    return data.docs as { title?: string; slug?: string }[]
  } catch {
    return []
  }
}

export default async function CaseStudiesIndex() {
  const studies = await fetchCaseStudies()

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
      <BreadcrumbsBar breadcrumbs={[]} hero={{ type: 'default' } as Page['hero']} />
      <div className={classes.wrapper}>
        <BackgroundGrid zIndex={0} />
        <Gutter>
          <header className={classes.header}>
            <p className={classes.eyebrow}>Portofolio</p>
            <h1 className={classes.heading}>Studi Kasus</h1>
            <p className={classes.lead}>
              Proyek nyata yang kami kerjakan — setiap hasil punya cerita, tantangan, dan angka.
            </p>
          </header>
          {studies.length === 0 ? (
            <p className={classes.empty}>Belum ada studi kasus yang dipublikasikan.</p>
          ) : (
            <ul className={classes.grid}>
              {studies.map((study) => (
                <li className={classes.item} key={study.slug}>
                  <Link className={classes.cardLink} href={`/case-studies/${study.slug}`}>
                    <span className={classes.cardTitle}>{study.title}</span>
                    <span className={classes.cardCta}>Lihat studi kasus →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Gutter>
      </div>
    </React.Fragment>
  )
}
