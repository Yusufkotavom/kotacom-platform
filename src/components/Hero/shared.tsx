import * as React from 'react'
import type { Page, Post, CaseStudy } from '@root/payload-types'
import { LinkButton, type LinkButtonProps } from '@components/nb/Button'
import { cn } from '@root/utilities/cn'

export function getHref(link?: any): string {
  if (!link) return '#'
  if (link.url) return link.url
  if (link.type === 'reference' && link.reference?.value) {
    const ref = link.reference.value
    if (typeof ref === 'object') {
      if (link.reference.relationTo === 'pages') {
        const bc = ref.breadcrumbs
        if (bc?.length) return bc[bc.length - 1]?.url || `/${ref.slug || ''}`
        return `/${ref.slug || ''}`
      }
      if (link.reference.relationTo === 'posts') return `/posts/${ref.slug}`
      if (link.reference.relationTo === 'case_studies') return `/case-studies/${ref.slug}`
      return `/${link.reference.relationTo}/${ref.slug}`
    }
    if (typeof ref === 'string') {
      return `/${link.reference.relationTo}/${ref}`
    }
  }
  return '#'
}

export function HeroLinkButton({
  link: linkProp,
  variant = 'primary',
  size = 'md',
  className,
}: {
  link: any
  variant?: LinkButtonProps['variant']
  size?: LinkButtonProps['size']
  className?: string
}) {
  const link = linkProp && 'link' in linkProp ? linkProp.link : linkProp
  if (!link || (!link.label && !link.url)) return null

  const href = getHref(link)
  const isNewTab = Boolean(link.newTab)

  return (
    <LinkButton
      href={href}
      target={isNewTab ? '_blank' : undefined}
      rel={isNewTab ? 'noopener noreferrer' : undefined}
      variant={variant}
      size={size}
      className={className}
    >
      <span>{link.label || 'Kunjungi'}</span>
      <span className="font-mono">{isNewTab ? '↗' : '→'}</span>
    </LinkButton>
  )
}

export function HeroEyebrow({
  children = 'Kotacom Platform',
  dotColor = 'bg-nb-red',
  className,
}: {
  children?: React.ReactNode
  dotColor?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-nb-sm',
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', dotColor)} />
      {children}
    </span>
  )
}
