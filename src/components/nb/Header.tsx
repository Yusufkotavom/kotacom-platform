'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { LinkButton } from '../nb/Button'

export interface NavItem {
  label: string
  href: string
}

const FALLBACK: NavItem[] = [
  { label: 'Layanan', href: '#layanan' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Portofolio', href: '#portofolio' },
  { label: 'FAQ', href: '#faq' },
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
  whatsapp = '#',
}: {
  items?: NavItem[]
  whatsapp?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink bg-canvas">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" aria-label="Kotacom — beranda">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm font-bold uppercase tracking-wide hover:text-nb-red"
            >
              {it.label}
            </Link>
          ))}
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
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="border-b-2 border-ink py-3 text-sm font-bold uppercase tracking-wide last:border-b-0 hover:text-nb-red"
              >
                {it.label}
              </Link>
            ))}
            <LinkButton href={whatsapp} variant="primary" size="md" className="my-3">
              Konsultasi <span className="font-black">&rarr;</span>
            </LinkButton>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
