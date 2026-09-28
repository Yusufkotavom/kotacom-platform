'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { Media } from '@components/Media'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const CenteredContent: React.FC<
  {
    breadcrumbs?: Page['breadcrumbs']
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & Pick<Page['hero'], 'enableMedia' | 'links' | 'media' | 'richText' | 'theme'>
> = ({ enableMedia, links, media, pageTitle, richText, theme }) => {
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const isDark = theme === 'dark'

  return (
    <Section bg={isDark ? 'ink' : 'canvas'} className="relative overflow-hidden text-center">
      {/* Decorative Bauhaus shapes */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full border-4 border-ink bg-nb-red opacity-30 select-none"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 bottom-6 h-32 w-32 rotate-45 border-4 border-ink bg-nb-yellow opacity-40 select-none"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <HeroEyebrow dotColor="bg-nb-blue">Kotacom</HeroEyebrow>

        {pageTitle && (
          <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl font-black">
            {pageTitle}
          </h1>
        )}

        {hasRichText && (
          <div className="mt-6 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl">
            <RichText content={richText} />
          </div>
        )}

        {Array.isArray(links) && links.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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

        {enableMedia && media && typeof media !== 'string' && (
          <div className="mt-12 w-full max-w-5xl overflow-hidden border-4 border-ink bg-paper shadow-nb-lg">
            <Media resource={media} />
          </div>
        )}
      </div>
    </Section>
  )
}
