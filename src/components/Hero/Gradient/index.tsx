'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { Media } from '@components/Media/index'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const GradientHero: React.FC<
  {
    breadcrumbs?: Page['breadcrumbs']
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & Pick<
    Page['hero'],
    | 'description'
    | 'enableBreadcrumbsBar'
    | 'fullBackground'
    | 'images'
    | 'links'
    | 'richText'
    | 'theme'
  >
> = ({
  description,
  fullBackground,
  images,
  links,
  pageTitle,
  richText,
  theme,
}) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const isDark = theme === 'dark' || Boolean(fullBackground)

  return (
    <Section bg={isDark ? 'ink' : 'canvas'} bleed className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        {/* Left Column: Content */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-20 lg:pr-12">
          <HeroEyebrow dotColor="bg-nb-yellow">Eksplorasi</HeroEyebrow>

          {pageTitle && (
            <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-5xl lg:text-6xl font-black">
              {pageTitle}
            </h1>
          )}

          {hasRichText && (
            <div className="mt-6 text-lg font-medium leading-relaxed sm:text-xl">
              <RichText content={richText} />
            </div>
          )}

          {hasDescription && (
            <div className="mt-4 max-w-xl text-base font-medium leading-relaxed opacity-90">
              <RichText content={description} />
            </div>
          )}

          {Array.isArray(links) && links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {links.map((linkItem, i) => (
                <HeroLinkButton
                  key={i}
                  link={linkItem}
                  variant={i === 0 ? 'primary' : 'outline'}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Bauhaus Visual Presentation */}
        <div className="relative flex min-h-[340px] items-center justify-center border-t-4 border-ink bg-nb-yellow p-6 sm:p-10 lg:border-l-4 lg:border-t-0">
          <span className="absolute inset-0 opacity-15 dots" />

          {images && Array.isArray(images) && images.length > 0 ? (
            <div className="relative z-10 grid w-full max-w-md gap-4">
              {images.slice(0, 2).map((item, idx) => {
                const img = typeof item === 'object' && 'image' in item ? item.image : item
                if (!img || typeof img === 'string') return null
                return (
                  <div
                    key={idx}
                    className="overflow-hidden border-4 border-ink bg-paper shadow-nb-lg"
                  >
                    <Media resource={img} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="relative z-10 flex h-64 w-64 items-center justify-center">
              <span className="block h-40 w-40 rounded-full border-4 border-ink bg-nb-red shadow-nb" />
              <span className="-ml-12 block h-32 w-32 rotate-45 border-4 border-ink bg-nb-blue shadow-nb" />
              <span className="tri -ml-8 block h-24 w-24 border-4 border-ink bg-paper shadow-nb" />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
