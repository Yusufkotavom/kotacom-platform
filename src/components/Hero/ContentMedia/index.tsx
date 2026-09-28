'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { Media } from '@components/Media/index'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const ContentMediaHero: React.FC<
  {
    breadcrumbs?: Page['breadcrumbs']
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & Pick<Page['hero'], 'description' | 'links' | 'media' | 'richText' | 'theme'>
> = ({ description, links, media, pageTitle, richText, theme }) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const hasMedia = typeof media === 'object' && media !== null
  const isDark = theme === 'dark'

  return (
    <Section bg={isDark ? 'ink' : 'canvas'} bleed className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        {/* Left column: Content */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-20 lg:pr-12">
          <HeroEyebrow dotColor="bg-nb-red">Digital Studio</HeroEyebrow>

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

        {/* Right column: Media panel */}
        <div className="relative flex min-h-[320px] items-center justify-center border-t-4 border-ink bg-paper p-6 sm:p-10 lg:border-l-4 lg:border-t-0">
          <span className="absolute inset-0 opacity-10 dots" />

          {hasMedia ? (
            <div className="relative z-10 w-full overflow-hidden border-4 border-ink bg-canvas shadow-nb-lg">
              <Media resource={media} />
            </div>
          ) : (
            <div className="relative z-10 flex h-64 w-64 items-center justify-center">
              <span className="block h-36 w-36 rounded-full border-4 border-ink bg-nb-yellow shadow-nb" />
              <span className="-ml-10 block h-28 w-28 rotate-45 border-4 border-ink bg-nb-blue shadow-nb" />
              <span className="tri -ml-8 block h-24 w-24 border-4 border-ink bg-nb-red shadow-nb" />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
