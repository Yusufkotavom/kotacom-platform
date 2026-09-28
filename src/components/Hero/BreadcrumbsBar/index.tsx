'use client'

import type { CMSLinkType } from '@components/CMSLink/index'
import type { Page } from '@root/payload-types'
import Link from 'next/link'
import React, { useMemo } from 'react'
import { HeroLinkButton } from '../shared'

interface HeroProps {
  hero: Page['hero']
  links?: never
}

interface LinksProps {
  hero?: never
  links?: CMSLinkType[]
}

type Conditional = HeroProps | LinksProps

type Props = {
  breadcrumbs?: Page['breadcrumbs']
} & Conditional

const BreadcrumbsBar: React.FC<Props> = ({
  breadcrumbs: breadcrumbsProps,
  hero,
  links: linksFromProps,
}) => {
  const links = hero?.breadcrumbsBarLinks ?? linksFromProps
  const enableBreadcrumbsBar = Boolean(linksFromProps ?? hero?.enableBreadcrumbsBar)

  const breadcrumbs = useMemo(() => {
    return (breadcrumbsProps ?? []).filter((b) => Boolean(b && b.label))
  }, [breadcrumbsProps])

  const hasLinks = Array.isArray(links) && links.length > 0
  const hasBreadcrumbs = breadcrumbs.length > 0

  // If breadcrumbs bar is not enabled and there are no breadcrumbs to show, render nothing.
  if (!enableBreadcrumbsBar && !hasBreadcrumbs) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumbs and page navigation"
      className="relative z-10 border-b-4 border-ink bg-paper py-3 text-ink"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {hasBreadcrumbs && (
          <div className="flex flex-wrap items-center gap-2">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const label = typeof item.label === 'string' ? item.label : String(item.label || '')

              return (
                <React.Fragment key={index}>
                  {item.url && !isLast ? (
                    <Link
                      href={item.url}
                      className="inline-flex items-center border-2 border-ink bg-canvas px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm transition-colors hover:bg-nb-yellow"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center border-2 border-ink bg-nb-yellow px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-nb-sm">
                      {label}
                    </span>
                  )}
                  {!isLast && <span className="font-mono text-xs font-black text-ink select-none">/</span>}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {hasLinks && (
          <div className="flex flex-wrap items-center gap-2">
            {links.map((linkItem, i) => (
              <HeroLinkButton key={i} link={linkItem} variant="outline" size="sm" />
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default BreadcrumbsBar
