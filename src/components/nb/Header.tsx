'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'
import { LinkButton } from '../nb/Button'

export interface NavSubItem {
  label: string
  href: string
  description?: string
}

export interface NavItem {
  label: string
  href?: string
  children?: NavSubItem[]
}

/** Canonical WhatsApp number for the whole site (see SiteSettings default). */
export const WHATSAPP_HREF =
  'https://wa.me/6285799520350?text=' +
  encodeURIComponent('Halo Kotacom, saya ingin konsultasi mengenai layanan Anda.')

/** Primary navigation with nested sub-items. */
const FALLBACK: NavItem[] = [
  {
    label: 'Layanan',
    children: [
      { label: 'Semua Produk', href: '/produk', description: 'Jelajahi seluruh layanan Kotacom' },
      { label: 'Cetak Buku', href: '/produk/cetak-buku', description: 'Buku, modul, novel, tahunan' },
      { label: 'Company Profile', href: '/produk/company-profile', description: 'Profil perusahaan profesional' },
      { label: 'Sistem Digital', href: '/produk/sistem-digital', description: 'Website & aplikasi custom' },
      { label: 'Kemasan Produk', href: '/produk/kemasan-produk', description: 'Packaging & label' },
    ],
  },
  { label: 'Web Dev', href: '/pembuatan-website' },
  { label: 'Software', href: '/software' },
  { label: 'IT Service', href: '/layanan' },
  { label: 'Percetakan', href: '/percetakan' },
  { label: 'Studi Kasus', href: '/case-studies' },
  { label: 'Blog', href: '/posts' },
]

/** Geometric Bauhaus wordmark: circle + rotated square + triangle. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <span className="inline-flex items-center">
        <span className="block h-6 w-6 rounded-full border-2 border-ink bg-nb-red" />
        <span className="-ml-1 block h-6 w-6 rotate-45 border-2 border-ink bg-nb-blue" />
        <span className="tri -ml-1 block h-5 w-5 border-2 border-ink bg-nb-yellow" />
      </span>
      <span className="text-xl font-black uppercase tracking-tight">Kotacom</span>
    </span>
  )
}

export function Header({
  items = FALLBACK,
  whatsapp = WHATSAPP_HREF,
}: {
  items?: NavItem[]
  whatsapp?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = React.useState<Record<string, boolean>>({})

  const toggleMobileSub = (label: string) => {
    setMobileExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink bg-canvas">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" aria-label="Kotacom — beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {items.map((it) => {
            const hasChildren = Array.isArray(it.children) && it.children.length > 0
            if (hasChildren) {
              const isOpen = activeDropdown === it.label
              return (
                <div
                  key={it.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(it.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : it.label)}
                    className="flex items-center gap-1 py-2 text-sm font-bold uppercase tracking-wide hover:text-nb-red"
                  >
                    {it.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen ? (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="w-64 border-4 border-ink bg-paper p-2 shadow-nb-lg">
                        {it.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block border-b-2 border-transparent p-2.5 transition-colors hover:border-ink hover:bg-canvas"
                          >
                            <span className="block text-xs font-black uppercase tracking-wide text-ink hover:text-nb-red">
                              {child.label}
                            </span>
                            {child.description ? (
                              <span className="mt-0.5 block font-mono text-[10px] text-ink/70">
                                {child.description}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            }

            return (
              <Link
                key={it.href || it.label}
                href={it.href || '#'}
                className="py-2 text-sm font-bold uppercase tracking-wide hover:text-nb-red"
              >
                {it.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:block">
          <LinkButton href={whatsapp} variant="primary" size="sm">
            Konsultasi
            <span className="font-black">&rarr;</span>
          </LinkButton>
        </div>

        <button
          type="button"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper shadow-nb-sm lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="border-t-4 border-ink bg-paper lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {items.map((it) => {
              const hasChildren = Array.isArray(it.children) && it.children.length > 0
              if (hasChildren) {
                const isSubOpen = Boolean(mobileExpanded[it.label])
                return (
                  <div key={it.label} className="border-b-2 border-ink py-2">
                    <button
                      type="button"
                      onClick={() => toggleMobileSub(it.label)}
                      className="flex w-full items-center justify-between py-1 text-sm font-bold uppercase tracking-wide hover:text-nb-red"
                    >
                      <span>{it.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-150 ${isSubOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isSubOpen ? (
                      <div className="my-2 border-l-4 border-nb-red bg-canvas/60 pl-3">
                        {it.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-xs font-bold uppercase tracking-wide hover:text-nb-red"
                          >
                            <div>{child.label}</div>
                            {child.description ? (
                              <div className="font-mono text-[10px] text-ink/70">
                                {child.description}
                              </div>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              }

              return (
                <Link
                  key={it.href || it.label}
                  href={it.href || '#'}
                  onClick={() => setOpen(false)}
                  className="border-b-2 border-ink py-3 text-sm font-bold uppercase tracking-wide last:border-b-0 hover:text-nb-red"
                >
                  {it.label}
                </Link>
              )
            })}
            <LinkButton href={whatsapp} variant="primary" size="md" className="my-3">
              Konsultasi <span className="font-black">&rarr;</span>
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
