import { Footer } from '@components/nb/Footer'
import { Header } from '@components/nb/Header'
import { FloatingContact } from '@components/FloatingContact/index'
import { fetchGlobals } from '@data/index'
import {
  mapFooterColumns,
  mapMainMenuTabs,
  mapSiteSettingsAddress,
  resolveCmsLink,
} from '@root/utilities/resolveCmsNavigation'
import React from 'react'

// Render the whole (pages) group on demand. `next build` must never prerender these
// routes: the Dokploy builder runs OUTSIDE `dokploy-network` and cannot reach the
// database, so any static prerender that initialises Payload fails the build
// (`payloadInitError` → "Export encountered an error on /(frontend)/(pages)/page: /").
// DB-backed routes in this group are already `force-dynamic`; this makes the group
// consistent so even fully-static pages (the home page) are not prerendered.
export const dynamic = 'force-dynamic'

/** Marketing/content shell: Bauhaus header + footer around page content, driven by CMS globals. */
export default async function PagesLayout({ children }: { children: React.ReactNode }) {
  const { mainMenu, footer, siteSettings } = await fetchGlobals()

  const navItems = mapMainMenuTabs(mainMenu?.tabs)
  const menuCta = mainMenu?.menuCta?.label
    ? {
        label: mainMenu.menuCta.label,
        href: resolveCmsLink(mainMenu.menuCta).href,
      }
    : undefined

  const whatsappHref = siteSettings?.whatsappNumber
    ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`
    : undefined

  const footerColumns = mapFooterColumns(footer?.columns)
  const offices = mapSiteSettingsAddress(siteSettings)

  return (
    <div className="min-h-screen bg-canvas">
      <Header
        items={navItems}
        businessName={siteSettings?.businessName || ''}
        whatsapp={whatsappHref}
        menuCta={menuCta}
      />
      <main>{children}</main>
      <Footer
        businessName={siteSettings?.businessName || ''}
        summary={siteSettings?.description || ''}
        whatsapp={
          siteSettings?.whatsappNumber
            ? {
                href: `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}`,
                display: siteSettings.whatsappNumber,
              }
            : undefined
        }
        phone={
          siteSettings?.phone
            ? {
                href: `tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`,
                display: siteSettings.phone,
              }
            : undefined
        }
        email={siteSettings?.email || ''}
        offices={offices}
        columns={footerColumns}
        foundedYear={siteSettings?.foundedYear || ''}
      />
      <FloatingContact
        whatsappNumber={siteSettings?.whatsappNumber || ''}
        phone={siteSettings?.phone || ''}
      />
    </div>
  )
}
