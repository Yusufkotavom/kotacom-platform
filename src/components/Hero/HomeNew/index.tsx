'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { Shape } from '@components/nb/Shape'
import { Media } from '@components/Media/index'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const HomeNewHero: React.FC<
  {
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & Page['hero']
> = ({
  announcementLink,
  description,
  enableAnnouncement,
  images,
  logoShowcase,
  logoShowcaseLabel,
  pageTitle,
  primaryButtons,
  richText,
  secondaryButtons,
}) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const filteredLogos = logoShowcase?.filter((logo) => typeof logo !== 'string')

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
            <HeroEyebrow dotColor="bg-nb-red">Kotacom Platform</HeroEyebrow>
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

          {/* Action buttons */}
          {((Array.isArray(primaryButtons) && primaryButtons.length > 0) ||
            (Array.isArray(secondaryButtons) && secondaryButtons.length > 0)) && (
            <div className="mt-8 flex flex-wrap gap-4">
              {Array.isArray(primaryButtons) &&
                primaryButtons.map((btn, i) => (
                  <HeroLinkButton
                    key={`p-${i}`}
                    link={btn}
                    variant={i === 0 ? 'primary' : 'outline'}
                    size="md"
                  />
                ))}
              {Array.isArray(secondaryButtons) &&
                secondaryButtons.map((btn, i) => (
                  <HeroLinkButton
                    key={`s-${i}`}
                    link={btn}
                    variant="yellow"
                    size="md"
                  />
                ))}
            </div>
          )}
        </div>

        {/* Right Column: Bauhaus Visual Panel */}
        <div className="relative flex min-h-[360px] items-center justify-center border-t-4 border-ink bg-nb-yellow p-6 sm:p-10 lg:border-l-4 lg:border-t-0">
          <span className="absolute inset-0 opacity-15 dots" />

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
              <Shape kind="circle" tone="blue" className="absolute left-4 top-0 h-40 w-40 lg:h-52 lg:w-52" />
              <Shape kind="diamond" tone="red" className="absolute bottom-2 right-2 h-32 w-32 lg:h-40 lg:w-40" />
              <Shape kind="triangle" tone="white" className="absolute bottom-10 left-16 h-24 w-24" />
              <span className="absolute right-10 top-12 block h-14 w-14 rounded-full border-4 border-white bg-ink" />
            </div>
          )}
        </div>
      </div>

      {/* Logo Showcase */}
      {filteredLogos && filteredLogos.length > 0 && (
        <div className="border-t-4 border-ink bg-paper py-6">
          {logoShowcaseLabel && (
            <div className="mx-auto mb-4 max-w-7xl px-4 text-center font-mono text-xs font-bold uppercase tracking-widest">
              <RichText content={logoShowcaseLabel} />
            </div>
          )}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-4">
            {filteredLogos.map((logo, idx) => (
              <div key={idx} className="h-10 max-w-[140px] opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                <Media resource={logo} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}
