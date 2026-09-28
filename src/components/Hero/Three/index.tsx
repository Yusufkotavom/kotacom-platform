'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { Shape } from '@components/nb/Shape'
import { Media } from '@components/Media/index'
import { NewsletterSignUp } from '@components/NewsletterSignUp'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const ThreeHero: React.FC<
  {
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & Pick<
    Page['hero'],
    | 'announcementLink'
    | 'buttons'
    | 'description'
    | 'enableAnnouncement'
    | 'images'
    | 'newsletter'
    | 'richText'
    | 'theme'
    | 'threeCTA'
  >
> = ({
  announcementLink,
  buttons,
  description,
  enableAnnouncement,
  images,
  newsletter,
  pageTitle,
  richText,
  threeCTA,
}) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)

  return (
    <Section bg="canvas" bleed className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        {/* Left Column */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-20 lg:pr-12">
          {enableAnnouncement && announcementLink ? (
            <div className="mb-4">
              <HeroLinkButton link={announcementLink} variant="outline" size="sm" />
            </div>
          ) : (
            <HeroEyebrow dotColor="bg-nb-blue">Kotacom Platform</HeroEyebrow>
          )}

          {pageTitle && !hasRichText && (
            <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl font-black">
              {pageTitle}
            </h1>
          )}

          {hasRichText && (
            <div className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl font-black">
              <RichText content={richText} />
            </div>
          )}

          {hasDescription && (
            <div className="mt-6 max-w-xl text-lg font-medium leading-relaxed opacity-90">
              <RichText content={description} />
            </div>
          )}

          {threeCTA === 'buttons' && buttons && Array.isArray(buttons) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {(buttons as any[]).map((btn, i) => {
                if (btn.blockType === 'link' && btn.link) {
                  return (
                    <HeroLinkButton
                      key={i}
                      link={btn.link}
                      variant={i === 0 ? 'primary' : 'outline'}
                      size="md"
                    />
                  )
                }
                return null
              })}
            </div>
          )}

          {threeCTA === 'newsletter' && (
            <div className="mt-8 max-w-md border-2 border-ink bg-paper p-4 shadow-nb-sm">
              <NewsletterSignUp
                description={newsletter?.description ?? undefined}
                placeholder={newsletter?.placeholder ?? undefined}
              />
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="relative flex min-h-[360px] items-center justify-center border-t-4 border-ink bg-nb-blue p-6 sm:p-10 lg:border-l-4 lg:border-t-0">
          <span className="absolute inset-0 opacity-20 dots-white" />

          {images && Array.isArray(images) && images.length > 0 ? (
            <div className="relative z-10 grid w-full max-w-md gap-4">
              {images.slice(0, 2).map((item, idx) => {
                const img = typeof item === 'object' && 'image' in item ? item.image : item
                if (!img || typeof img === 'string') return null
                return (
                  <div key={idx} className="overflow-hidden border-4 border-ink bg-paper shadow-nb-lg">
                    <Media resource={img} />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="relative z-10 h-64 w-64 lg:h-80 lg:w-80">
              <Shape kind="circle" tone="yellow" className="absolute left-4 top-0 h-40 w-40 lg:h-52 lg:w-52" />
              <Shape kind="diamond" tone="red" className="absolute bottom-2 right-2 h-32 w-32 lg:h-40 lg:w-40" />
              <Shape kind="triangle" tone="white" className="absolute bottom-10 left-16 h-24 w-24" />
              <span className="absolute right-10 top-12 block h-14 w-14 rounded-full border-4 border-white bg-ink" />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
