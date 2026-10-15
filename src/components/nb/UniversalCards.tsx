'use client'

import React, { useEffect, useState } from 'react'
import { Card } from './Card'
import { LinkButton } from './Button'
import { RichText } from '@components/RichText/index'

export interface UniversalCardItem {
  id?: string
  title: string
  excerpt?: string
  url: string
  badge?: string
  richText?: any
  imageUrl?: string | null
}

export function BauhausUniversalCards({
  fields,
  id,
  variant = 'cards',
}: {
  fields: any
  id?: string
  variant?: 'cards' | 'highlight'
}) {
  const {
    headline,
    introText,
    richText: blockRichText,
    contentType = 'case-studies',
    selectionMode = 'manual',
    limit = 3,
    cards = [],
    caseStudies = [],
  } = fields || {}

  const [items, setItems] = useState<UniversalCardItem[]>([])
  const [loading, setLoading] = useState(false)

  // Resolve manual items helper
  const resolveManualItems = (): UniversalCardItem[] => {
    if (variant === 'cards' && Array.isArray(cards) && cards.length > 0) {
      return cards.map((c: any, i: number) => {
        const doc = typeof c.caseStudy === 'object' && c.caseStudy?.value ? c.caseStudy.value : typeof c.caseStudy === 'object' ? c.caseStudy : null
        const relation = typeof c.caseStudy === 'object' && c.caseStudy?.relationTo ? c.caseStudy.relationTo : contentType
        return formatDocToItem(doc, relation, c.richText, i)
      })
    }

    if (variant === 'highlight' && Array.isArray(caseStudies) && caseStudies.length > 0) {
      return caseStudies.map((cs: any, i: number) => {
        const doc = typeof cs === 'object' && cs?.value ? cs.value : typeof cs === 'object' ? cs : null
        const relation = typeof cs === 'object' && cs?.relationTo ? cs.relationTo : contentType
        return formatDocToItem(doc, relation, null, i)
      })
    }

    return []
  }

  const formatDocToItem = (doc: any, relation: string, customRichText: any, index: number): UniversalCardItem => {
    let slug = doc?.slug || ''
    let url = `/case-studies/${slug}`
    let badge = 'Studi Kasus'

    if (relation === 'posts') {
      const cat = typeof doc?.category === 'object' && doc?.category?.slug ? doc.category.slug : 'blog'
      url = `/posts/${cat}/${slug}`
      badge = 'Artikel'
    } else if (relation === 'products') {
      url = `/produk/${slug}`
      badge = 'Produk'
    } else if (relation === 'pages') {
      url = `/${slug}`
      badge = 'Halaman'
    }

    const title = doc?.title || `Item ${index + 1}`
    const excerpt = doc?.excerpt || doc?.shortDescription || doc?.meta?.description || ''
    const featuredImg = doc?.featuredImage || doc?.image || doc?.meta?.image
    const imageUrl = typeof featuredImg === 'object' && featuredImg?.url ? featuredImg.url : null

    return {
      id: doc?.id || String(index),
      title,
      excerpt,
      url,
      badge,
      richText: customRichText,
      imageUrl,
    }
  }

  useEffect(() => {
    if (selectionMode === 'manual') {
      setItems(resolveManualItems())
      return
    }

    // Dynamic query from API for latest or random
    let isMounted = true
    setLoading(true)

    fetch(`/api/content-items?collection=${encodeURIComponent(contentType)}&mode=${encodeURIComponent(selectionMode)}&limit=${encodeURIComponent(limit)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.ok && Array.isArray(data.items)) {
          setItems(data.items)
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic content items:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectionMode, contentType, limit, cards, caseStudies])

  if (items.length === 0 && !headline && !introText && !blockRichText && !loading) {
    return null
  }

  const displayIntro = introText || blockRichText

  return (
    <div id={id} className="w-full">
      {/* Heading / Intro */}
      {headline || displayIntro ? (
        <div className="mb-10 max-w-3xl">
          {headline ? (
            <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
              {headline}
            </h2>
          ) : null}
          {displayIntro ? (
            <div className="text-base leading-relaxed text-ink/80 sm:text-lg">
              <RichText content={displayIntro} />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Grid Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const cornerShape = variant === 'cards' ? 'square' : 'triangle'
          const cornerTone = (['blue', 'red', 'yellow'] as const)[i % 3]

          return (
            <Card
              key={item.id || i}
              cornerShape={cornerShape}
              cornerTone={cornerTone}
              className="flex flex-col justify-between p-7"
            >
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="inline-block border-2 border-ink bg-nb-yellow px-2 py-0.5 font-mono text-xs font-black uppercase tracking-wider text-ink shadow-nb-sm">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight text-ink">
                  {item.title}
                </h3>

                {item.richText ? (
                  <div className="mt-3 text-sm leading-relaxed text-ink/85">
                    <RichText content={item.richText} />
                  </div>
                ) : item.excerpt ? (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-ink/80">
                    {item.excerpt}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 border-t-2 border-ink/10 pt-4">
                <LinkButton
                  href={item.url}
                  variant={variant === 'cards' ? 'outline' : 'primary'}
                  size="sm"
                  className="w-full text-center"
                >
                  {variant === 'cards' ? 'Buka Detail →' : 'Eksplor Sekarang →'}
                </LinkButton>
              </div>
            </Card>
          )
        })}

        {loading && (
          <div className="col-span-full py-8 text-center font-mono text-sm font-bold uppercase tracking-wider text-ink/60">
            Memuat konten...
          </div>
        )}
      </div>
    </div>
  )
}

export default BauhausUniversalCards
