import type { Footer, MainMenu, SiteSetting } from '@root/payload-types'
import type { NavItem, NavSubItem } from '@components/nb/Header'
import type { FooterColumn } from '@components/nb/Footer'

export function resolveCmsLink(linkData: any): { href: string; label?: string; target?: string } {
  if (!linkData) return { href: '#' }

  const link = linkData.link || linkData
  const type = link.type
  const target = link.newTab ? '_blank' : undefined
  const label = link.label || linkData.label || undefined

  if (type === 'custom' || (!type && link.url)) {
    return { href: link.url || '#', label, target }
  }

  if (type === 'reference' && link.reference) {
    const ref = link.reference
    const relationTo = ref.relationTo
    const val = ref.value
    let slug = ''

    if (typeof val === 'string') {
      slug = val
    } else if (val && typeof val === 'object') {
      if (Array.isArray(val.breadcrumbs) && val.breadcrumbs.length > 0) {
        const last = val.breadcrumbs[val.breadcrumbs.length - 1]
        if (last?.url) {
          return { href: last.url, label: label || val.title, target }
        }
      }
      slug = val.slug || ''
    }

    if (relationTo === 'pages') {
      const href = !slug || slug === 'home' ? '/' : `/${slug.replace(/^\//, '')}`
      return { href, label, target }
    }
    if (relationTo === 'posts') {
      return { href: `/posts/${slug}`, label, target }
    }
    if (relationTo === 'products') {
      return { href: `/produk/${slug}`, label, target }
    }
    if (relationTo === 'case-studies' || relationTo === 'case_studies') {
      return { href: `/case-studies/${slug}`, label, target }
    }
    return { href: `/${slug}`, label, target }
  }

  return { href: link.url || '#', label, target }
}

export function mapMainMenuTabs(tabs?: MainMenu['tabs']): NavItem[] {
  if (!Array.isArray(tabs) || tabs.length === 0) return []

  return tabs
    .map((tab) => {
      const label = tab.label || ''
      let href: string | undefined = undefined

      if (tab.link) {
        const resolved = resolveCmsLink(tab.link)
        if (resolved.href && resolved.href !== '#') {
          href = resolved.href
        }
      }

      const children: NavSubItem[] = []
      if (tab.enableDropdown && Array.isArray(tab.navItems)) {
        for (const item of tab.navItems) {
          if (item.defaultLink?.link) {
            const res = resolveCmsLink(item.defaultLink.link)
            if (res.label) {
              children.push({
                label: res.label,
                href: res.href,
                description: item.defaultLink.description || undefined,
              })
            }
          }
          if (item.listLinks?.links && Array.isArray(item.listLinks.links)) {
            for (const listItem of item.listLinks.links) {
              if (listItem.link) {
                const res = resolveCmsLink(listItem.link)
                if (res.label) {
                  children.push({
                    label: res.label,
                    href: res.href,
                    description: item.listLinks.tag || undefined,
                  })
                }
              }
            }
          }
          if (item.featuredLink?.links && Array.isArray(item.featuredLink.links)) {
            for (const featuredItem of item.featuredLink.links) {
              if (featuredItem.link) {
                const res = resolveCmsLink(featuredItem.link)
                if (res.label) {
                  children.push({
                    label: res.label,
                    href: res.href,
                    description: item.featuredLink.tag || undefined,
                  })
                }
              }
            }
          }
        }
      }

      return {
        label,
        href,
        children: children.length > 0 ? children : undefined,
      }
    })
    .filter((it) => it.label.length > 0)
}

export function mapFooterColumns(columns?: Footer['columns']): FooterColumn[] {
  if (!Array.isArray(columns) || columns.length === 0) return []

  return columns
    .map((col) => {
      const title = col.label || ''
      const links: { label: string; href: string }[] = []

      if (Array.isArray(col.navItems)) {
        for (const item of col.navItems) {
          if (item.link) {
            const res = resolveCmsLink(item.link)
            if (res.label) {
              links.push({
                label: res.label,
                href: res.href,
              })
            }
          }
        }
      }

      return { title, links }
    })
    .filter((col) => col.title.length > 0)
}

export function mapSiteSettingsAddress(
  siteSettings?: SiteSetting | null,
): Array<{ label: string; lines: string[] }> {
  if (!siteSettings) return []

  const lines = [
    siteSettings.street,
    [siteSettings.city, siteSettings.region, siteSettings.postalCode].filter(Boolean).join(' '),
    siteSettings.country,
  ].filter(Boolean) as string[]

  if (lines.length === 0) return []

  return [
    {
      label: siteSettings.businessName ? `Kantor ${siteSettings.businessName}` : 'Alamat',
      lines,
    },
  ]
}
