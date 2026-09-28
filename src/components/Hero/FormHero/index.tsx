'use client'

import type { BlocksProp } from '@components/RenderBlocks/index'
import type { Page } from '@root/payload-types'
import { Section } from '@components/nb/Section'
import { CMSForm } from '@components/CMSForm/index'
import { RichText } from '@components/RichText/index'
import React from 'react'
import { HeroEyebrow } from '../shared'

export type FormHeroProps = Page['hero']

export const FormHero: React.FC<
  {
    breadcrumbs?: Page['breadcrumbs']
    firstContentBlock?: BlocksProp
    pageTitle?: string
  } & FormHeroProps
> = ({ description, form, pageTitle, richText, theme }) => {
  const hasDescription = Boolean(description && description.root?.children?.length > 0)
  const hasRichText = Boolean(richText && richText.root?.children?.length > 0)
  const isDark = theme === 'dark'

  if (!form || typeof form === 'string') {
    return null
  }

  return (
    <Section bg={isDark ? 'ink' : 'canvas'} className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-12">
        {/* Left: Info */}
        <div className="lg:col-span-5">
          <HeroEyebrow dotColor="bg-nb-red">Formulir Kontak</HeroEyebrow>

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
            <div className="mt-4 text-base font-medium leading-relaxed opacity-90">
              <RichText content={description} />
            </div>
          )}
        </div>

        {/* Right: Bauhaus Form Card */}
        <div className="border-4 border-ink bg-paper p-6 sm:p-10 shadow-nb-lg lg:col-span-7">
          <CMSForm form={form} />
        </div>
      </div>
    </Section>
  )
}
