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
import Link from 'next/link'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function NotFound() {
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
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <Header
        items={navItems}
        businessName={siteSettings?.businessName || ''}
        whatsapp={whatsappHref}
        menuCta={menuCta}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-xl w-full border-4 border-ink bg-paper p-8 sm:p-12 shadow-nb-lg text-center">
          <span className="inline-block border-2 border-ink bg-nb-red px-4 py-1 font-mono text-sm font-bold uppercase tracking-widest text-white shadow-nb-sm">
            Error 404
          </span>
          <h1 className="mt-6 text-6xl sm:text-7xl font-black uppercase tracking-tighter text-ink leading-none">
            404
          </h1>
          <h2 className="mt-4 text-xl sm:text-2xl font-black uppercase tracking-tight text-ink">
            Halaman Tidak Ditemukan
          </h2>
          <p className="mt-3 text-sm sm:text-base font-medium text-ink/80 leading-relaxed">
            Halaman yang Anda tuju tidak ditemukan, telah dipindahkan, atau alamat URL salah.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-nb-yellow px-6 py-3 font-bold uppercase tracking-wider text-ink shadow-nb hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              Kembali ke Beranda →
            </Link>
          </div>
        </div>
      </main>

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
