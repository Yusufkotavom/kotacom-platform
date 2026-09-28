'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const DefaultHero: React.FC<
  {
    firstContentBlock?: BlocksProp
    pageTitle?: string
    breadcrumbs?: Page['breadcrumbs']
    links?: Page['hero']['links']
  } & Pick<Page['hero'], 'description' | 'richText' | 'theme'>
> = ({ description, links, pageTitle, richText, theme }) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const isDark = theme === 'dark'

  return (
    <Section bg={isDark ? 'ink' : 'canvas'} className="relative overflow-hidden">
      {/* Decorative Bauhaus shapes in the background */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border-4 border-ink bg-nb-yellow opacity-40 select-none"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-24 h-24 w-24 rotate-45 border-4 border-ink bg-nb-blue opacity-30 select-none hidden sm:block"
      />

      <div className="relative z-10 max-w-4xl">
        <HeroEyebrow dotColor="bg-nb-red">Kotacom</HeroEyebrow>

        {pageTitle && (
          <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl font-black">
            {pageTitle}
          </h1>
        )}

        {hasRichText && (
          <div className="mt-6 text-xl font-medium leading-relaxed max-w-3xl">
            <RichText content={richText} />
          </div>
        )}

        {hasDescription && (
          <div className="mt-6 max-w-2xl text-lg font-medium leading-relaxed opacity-90">
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
    </Section>
  )
}
