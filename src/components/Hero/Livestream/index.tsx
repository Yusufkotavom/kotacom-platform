'use client'

import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { RichText } from '@components/RichText/index'
import { Video } from '@components/RichText/Video/index'
import { formatDate } from '@utilities/format-date-time'
import * as React from 'react'
import { HeroEyebrow, HeroLinkButton } from '../shared'

export const LivestreamHero: React.FC<{
  breadcrumbs?: Page['breadcrumbs']
  links?: Page['hero']['links']
  livestream?: Page['hero']['livestream']
  pageTitle?: string
}> = ({ links, livestream, pageTitle }) => {
  if (!livestream) return null

  const { id: youtubeID = '', date, guests, richText } = livestream
  const today = new Date()
  const liveDate = date ? new Date(date) : null
  const isLive = liveDate ? today >= liveDate : false

  return (
    <Section bg="canvas" className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-12">
        {/* Left column */}
        <div className="lg:col-span-6">
          <HeroEyebrow dotColor="bg-nb-red">
            {isLive ? '🔴 Sedang Berlangsung' : 'Livestream Event'}
          </HeroEyebrow>

          {pageTitle && (
            <h1 className="mt-6 text-4xl uppercase leading-[0.9] tracking-tighter sm:text-5xl lg:text-6xl font-black">
              {pageTitle}
            </h1>
          )}

          {richText && (
            <div className="mt-6 text-lg font-medium leading-relaxed sm:text-xl">
              <RichText content={richText} />
            </div>
          )}

          {date && (
            <div className="mt-6 inline-block border-2 border-ink bg-nb-yellow px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider shadow-nb-sm">
              Mulai: {formatDate({ date, format: 'dateAndTime' })}
            </div>
          )}

          {guests && Array.isArray(guests) && guests.length > 0 && (
            <div className="mt-8 border-t-2 border-ink pt-6">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">
                Narasumber / Tamu:
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {guests.map(({ image, link, name }, i) => (
                  <a
                    key={i}
                    href={link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border-2 border-ink bg-paper p-2 shadow-nb-sm transition-transform hover:-translate-y-0.5"
                  >
                    {image && typeof image !== 'string' && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SITE_URL || ''}${image.url}`}
                        alt={name || ''}
                        className="h-10 w-10 border border-ink object-cover"
                      />
                    )}
                    <span className="font-bold text-sm uppercase">{name}</span>
                  </a>
                ))}
              </div>
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

        {/* Right column: Video embed */}
        <div className="lg:col-span-6">
          {youtubeID ? (
            <div className="overflow-hidden border-4 border-ink bg-ink shadow-nb-lg">
              <Video id={youtubeID} platform="youtube" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center border-4 border-ink bg-paper p-8 text-center shadow-nb-lg">
              <div>
                <span className="inline-block h-16 w-16 rounded-full border-2 border-ink bg-nb-red" />
                <p className="mt-4 font-mono text-sm font-bold uppercase tracking-widest">
                  Streaming akan dimulai di sini
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
